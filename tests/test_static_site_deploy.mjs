import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildSite } from '../site/build.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewRoot = path.resolve(process.env.STATIC_SITE_PREVIEW_ROOT || projectRoot);
const dashboardSource = path.join(previewRoot, 'examples/responsive-dashboard/specimen');
const siteFiles = ['build.mjs', 'index.html', 'styles.css', 'manifest.schema.json'];
const dashboardFiles = ['app.js', 'components.js', 'fixture-data.js', 'index.html', 'styles.css'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const temporary = await mkdtemp(path.join(tmpdir(), 'static-site-deploy-'));
after(() => rm(temporary, { recursive: true, force: true }));

// A real reviewed preview is required, including when the current branch is main.
// CI checks out the pinned preview separately; no generated substitute can pass.
for (const name of dashboardFiles) {
  assert.ok((await stat(path.join(dashboardSource, name))).isFile(), `Real preview fixture missing ${name}; set STATIC_SITE_PREVIEW_ROOT`);
}

async function fixture(name, dashboard = false) {
  const root = path.join(temporary, name);
  await mkdir(path.join(root, 'site'), { recursive: true });
  for (const name of siteFiles) await cp(path.join(projectRoot, 'site', name), path.join(root, 'site', name));
  if (dashboard) await cp(dashboardSource, path.join(root, 'examples/responsive-dashboard/specimen'), { recursive: true });
  return root;
}

async function files(root, prefix = '') {
  const entries = await readdir(path.join(root, prefix), { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(root, path.posix.join(prefix, entry.name))
    : path.posix.join(prefix, entry.name)))).flat().sort();
}

async function assertArtifact(root, available) {
  const out = path.join(root, 'dist');
  const manifest = JSON.parse(await readFile(path.join(out, 'manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.dashboard.available, available);
  assert.deepEqual(manifest.availableDemos, available ? ['dashboard'] : []);
  assert.equal(manifest.sourceCommit, null, 'isolated fixture must not borrow another checkout revision');
  const expected = ['index.html', 'manifest.json', 'styles.css', ...(available ? dashboardFiles.map(name => `demos/dashboard/${name}`) : [])].sort();
  assert.deepEqual(await files(out), expected, 'output must contain only the public allowlist');
  assert.equal(new Set(manifest.files.map(item => item.path)).size, manifest.files.length);
  assert.deepEqual(manifest.files.map(item => item.path).sort(), expected.filter(name => name !== 'manifest.json'));
  for (const item of manifest.files) {
    const bytes = await readFile(path.join(out, item.path));
    assert.equal(item.sha256, digest(bytes), item.path);
    assert.equal(item.bytes, bytes.length, item.path);
  }
  const inputAllowlist = new Set([...siteFiles.map(name => `site/${name}`), ...(available ? dashboardFiles.map(name => `examples/responsive-dashboard/specimen/${name}`) : [])]);
  assert.equal(new Set(manifest.inputs.map(item => item.path)).size, manifest.inputs.length);
  assert.deepEqual(manifest.inputs.map(item => item.path).sort(), [...inputAllowlist].sort(), 'every approved build input needs a digest');
  for (const input of manifest.inputs) {
    assert.ok(inputAllowlist.has(input.path), `unapproved build input ${input.path}`);
    assert.equal(input.sha256, digest(await readFile(path.join(root, input.path))), input.path);
  }
  for (const name of expected.filter(name => name.endsWith('.html'))) {
    const html = await readFile(path.join(out, name), 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const value = match[1];
      assert.ok(!/^(?:javascript|file):/i.test(value), `unsafe URL ${value}`);
      if (/^(?:https?:|mailto:|tel:)/i.test(value) || value.startsWith('//')) continue;
      const url = new URL(value, `http://127.0.0.1/${name}`);
      const resource = decodeURIComponent(url.pathname).replace(/^\//, '');
      const target = resource.endsWith('/') ? `${resource}index.html` : resource || 'index.html';
      assert.ok(expected.includes(target), `${name}: missing local resource ${value}`);
      if (url.hash && target.endsWith('.html')) {
        const targetHtml = await readFile(path.join(out, target), 'utf8');
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok([...targetHtml.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].some(item => item[1] === id), `${name}: missing anchor ${value}`);
      }
    }
  }
  for (const name of expected.filter(name => name.endsWith('.css'))) {
    const css = await readFile(path.join(out, name), 'utf8');
    for (const match of css.matchAll(/url\(\s*["']?([^\s)"']+)["']?\s*\)/gi)) {
      if (match[1].startsWith('data:')) continue;
      const url = new URL(match[1], `http://127.0.0.1/${name}`);
      assert.equal(url.origin, 'http://127.0.0.1', `${name}: external runtime CSS asset`);
      assert.ok(expected.includes(decodeURIComponent(url.pathname).replace(/^\//, '')), `${name}: missing CSS asset ${match[1]}`);
    }
  }
  return manifest;
}

async function retain(root, name) {
  const destination = process.env.STATIC_SITE_SMOKE_ARTIFACTS;
  if (!destination) return;
  await mkdir(destination, { recursive: true });
  const target = path.join(destination, name);
  await assert.rejects(stat(target), { code: 'ENOENT' }, 'refuse to overwrite retained artifacts');
  await cp(path.join(root, 'dist'), target, { recursive: true, errorOnExist: true, force: false });
}

test('main builds an allowlisted landing page when the dashboard is absent', async () => {
  const root = await fixture('main');
  await buildSite({ projectRoot: root });
  await assertArtifact(root, false);
  const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
  assert.ok(!/href=["'][^"']*demos\/dashboard/i.test(html), 'absent dashboard must not expose a dead demo link');
  await retain(root, 'main');
});

test('preview publishes exact reviewed dashboard bytes and deterministic provenance', async () => {
  const root = await fixture('preview', true);
  await buildSite({ projectRoot: root });
  const manifest = await assertArtifact(root, true);
  for (const name of dashboardFiles) {
    assert.deepEqual(await readFile(path.join(root, 'dist/demos/dashboard', name)), await readFile(path.join(dashboardSource, name)), `deployed ${name} must preserve the reviewed source`);
  }
  const before = await readFile(path.join(root, 'dist/manifest.json'));
  await buildSite({ projectRoot: root });
  assert.deepEqual(await readFile(path.join(root, 'dist/manifest.json')), before, 'repeat build must not invent timestamps or change provenance');
  assert.deepEqual(await assertArtifact(root, true), manifest);
  await retain(root, 'preview');
});

test('CLI binds source revision to its own checkout despite ambient Git overrides', async () => {
  const root = await fixture('git-provenance');
  const gitOptions = { encoding: 'utf8', env: { PATH: process.env.PATH, LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } };
  execFileSync('git', ['-C', root, 'init', '--quiet'], gitOptions);
  execFileSync('git', ['-C', root, '-c', 'user.name=Static smoke', '-c', 'user.email=static-smoke@example.invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '--allow-empty', '--no-gpg-sign', '-m', 'fixture'], gitOptions);
  const expected = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], gitOptions).trim();
  execFileSync(process.execPath, [path.join(root, 'site/build.mjs')], {
    cwd: temporary,
    env: { ...process.env, GIT_DIR: path.join(temporary, 'missing-git-directory'), GIT_WORK_TREE: temporary, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.bare', GIT_CONFIG_VALUE_0: 'true' },
  });
  const manifest = JSON.parse(await readFile(path.join(root, 'dist/manifest.json'), 'utf8'));
  assert.equal(manifest.sourceCommit, expected);
  assert.equal(manifest.dashboard.available, false);
  await assert.rejects(stat(path.join(temporary, 'dist')), { code: 'ENOENT' }, 'working directory must not redirect output');
});

test('build does not execute source/configuration or publish private and evidence files', async () => {
  const root = await fixture('no-execution', true);
  const secret = 'DEPLOY_TEST_SECRET_MUST_NOT_ESCAPE_6bfcd1';
  await writeFile(path.join(root, '.env'), secret);
  await writeFile(path.join(root, 'package.json'), '{"scripts":{"build":"exit 99"}}');
  await writeFile(path.join(root, 'vite.config.js'), 'throw new Error("configuration must not run");');
  await writeFile(path.join(root, 'examples/responsive-dashboard/specimen/evidence.txt'), secret);
  await mkdir(path.join(root, 'examples/responsive-dashboard/evidence'), { recursive: true });
  await writeFile(path.join(root, 'examples/responsive-dashboard/evidence/private.json'), JSON.stringify({ secret }));
  const app = path.join(root, 'examples/responsive-dashboard/specimen/app.js');
  await writeFile(app, `${await readFile(app, 'utf8')}\n;throw new Error("BUILD_MUST_PARSE_WITHOUT_EXECUTING");\n`);
  await buildSite({ projectRoot: root });
  await assertArtifact(root, true);
  for (const name of await files(path.join(root, 'dist'))) assert.ok(!(await readFile(path.join(root, 'dist', name), 'utf8')).includes(secret), name);
});

test('preview to main rebuild removes stale demo and unexpected output files', async () => {
  const root = await fixture('stale-cleanup', true);
  await buildSite({ projectRoot: root });
  await writeFile(path.join(root, 'dist/stale-secret.txt'), 'not public');
  await rm(path.join(root, 'examples/responsive-dashboard'), { recursive: true });
  await buildSite({ projectRoot: root });
  await assertArtifact(root, false);
});

for (const [name, corrupt] of [
  ['partial', root => rm(path.join(root, 'examples/responsive-dashboard/specimen/components.js'))],
  ['truncated-html', async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/index.html');
    const content = await readFile(target, 'utf8');
    await writeFile(target, content.slice(0, Math.floor(content.length / 2)));
  }],
  ['truncated-data', async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/fixture-data.js');
    const content = await readFile(target, 'utf8');
    await writeFile(target, content.slice(0, Math.floor(content.length / 2)));
  }],
  ['empty-data', root => writeFile(path.join(root, 'examples/responsive-dashboard/specimen/fixture-data.js'), 'window.DashboardFixtureData = {};\n')],
  ['empty-app', root => writeFile(path.join(root, 'examples/responsive-dashboard/specimen/app.js'), '"use strict";\n')],
  ['malformed-js', root => writeFile(path.join(root, 'examples/responsive-dashboard/specimen/app.js'), '(() => {')],
  ...[
    ['unquoted-image', '<img src=https://example.invalid/tracker>'],
    ['unquoted-link', '<a href=https://example.invalid/tracker>Unexpected remote link</a>'],
    ['srcset', '<div srcset=https://example.invalid/tracker></div>'],
    ['unquoted-icon', '<link rel=icon href=https://example.invalid/tracker>'],
    ['inline-style-url', '<div style="background-image:url(https://example.invalid/tracker)"></div>'],
    ['style-tag-url', '<style>.probe{background:url(https://example.invalid/tracker)}</style>'],
    ['svg-image', '<svg><image href=https://example.invalid/tracker /></svg>'],
  ].map(([name, markup]) => [name, async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/index.html');
    await writeFile(target, (await readFile(target, 'utf8')).replace('</body>', `${markup}</body>`));
  }]),
  ['duplicate-unquoted-script-source', async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/index.html');
    await writeFile(target, (await readFile(target, 'utf8')).replace('<script src="./fixture-data.js"', '<script src=https://example.invalid/tracker src="./fixture-data.js"'));
  }],
  ['duplicate-unquoted-stylesheet-source', async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/index.html');
    await writeFile(target, (await readFile(target, 'utf8')).replace('<link rel="stylesheet" href="./styles.css"', '<link rel="stylesheet" href=https://example.invalid/tracker href="./styles.css"'));
  }],
  ['css-url', async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/styles.css');
    await writeFile(target, `${await readFile(target, 'utf8')}\n.probe{background:url(https://example.invalid/tracker)}\n`);
  }],
  ['missing-local-asset', async root => {
    const target = path.join(root, 'examples/responsive-dashboard/specimen/index.html');
    await writeFile(target, (await readFile(target, 'utf8')).replace('./styles.css', './missing.css'));
  }],
]) {
  test(`${name} dashboard fails the build and removes a prior passing artifact`, async () => {
    const root = await fixture(name, true);
    await buildSite({ projectRoot: root });
    await corrupt(root);
    await assert.rejects(buildSite({ projectRoot: root }));
    await assert.rejects(stat(path.join(root, 'dist/index.html')), { code: 'ENOENT' });
    await assert.rejects(stat(path.join(root, 'dist/manifest.json')), { code: 'ENOENT' });
  });
}

test('symlinked dashboard input is refused rather than copied from outside the source tree', async () => {
  const root = await fixture('input-symlink', true);
  const target = path.join(root, 'examples/responsive-dashboard/specimen/styles.css');
  await rm(target);
  await symlink(path.join(dashboardSource, 'styles.css'), target);
  await assert.rejects(buildSite({ projectRoot: root }));
});

test('every public file responds over local HTTP with its expected MIME type', async () => {
  const root = await fixture('http-smoke', true);
  await buildSite({ projectRoot: root });
  const out = path.join(root, 'dist');
  const server = spawn('python3', ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', out], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('local HTTP server did not become ready')), 10000);
      let output = '';
      server.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/port (\d+)/);
        if (match) { clearTimeout(timer); resolve(Number(match[1])); }
      });
      server.once('error', error => { clearTimeout(timer); reject(error); });
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`HTTP server exited ${code}: ${output}`)); });
    });
    for (const name of await files(out)) {
      const response = await fetch(`http://127.0.0.1:${port}/${name}`, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, name);
      const types = { '.html': ['text/html'], '.css': ['text/css'], '.js': ['text/javascript', 'application/javascript'], '.json': ['application/json'] }[path.extname(name)];
      assert.ok(types.includes(response.headers.get('content-type').split(';')[0]), `${name}: unexpected MIME ${response.headers.get('content-type')}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(path.join(out, name)), name);
    }
    assert.equal((await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(10000) })).status, 200);
    assert.equal((await fetch(`http://127.0.0.1:${port}/demos/dashboard/`, { signal: AbortSignal.timeout(10000) })).status, 200);
    assert.equal((await fetch(`http://127.0.0.1:${port}/does-not-exist.js`, { signal: AbortSignal.timeout(10000) })).status, 404);
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
  }
});
