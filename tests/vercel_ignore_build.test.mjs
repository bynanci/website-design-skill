import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const command = fileURLToPath(new URL('../scripts/vercel_ignore_build.mjs', import.meta.url));
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'vercel-ignore-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(['init', '-q']); git(['config', 'user.name', 'Deployment test']); git(['config', 'user.email', 'test@example.invalid']);
  const commit = (filename, content) => {
    mkdirSync(path.dirname(path.join(root, filename)), { recursive: true });
    writeFileSync(path.join(root, filename), content);
    git(['add', '--', filename]); git(['commit', '-qm', 'fixture']);
    return git(['rev-parse', 'HEAD']);
  };
  const before = commit('site/page.html', 'before');
  const run = (previous = before, requested = git(['rev-parse', 'HEAD'])) => spawnSync(process.execPath, [command], {
    cwd: root, encoding: 'utf8', env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: previous, VERCEL_GIT_COMMIT_SHA: requested },
  });
  return { root, git, commit, before, run };
}

test('only a verified irrelevant diff skips; the first deployment builds', t => {
  const f = fixture(t); f.commit('docs/guide.md', 'new guide');
  assert.equal(f.run('').status, 1);
  const result = f.run(); assert.equal(result.status, 0); assert.match(result.stdout, /unchanged/);
});
for (const filename of ['site/page.html', 'site/new.css', 'vercel.json', 'scripts/vercel_ignore_build.mjs', 'examples/responsive-dashboard/specimen/app.js']) {
  test(`changes to ${filename} require an actual build`, t => {
    const f = fixture(t); f.commit(filename, 'changed');
    assert.equal(f.run().status, 1);
  });
}
test('deleting a deployment input builds rather than retaining a stale asset', t => {
  const f = fixture(t); f.git(['rm', 'site/page.html']); f.git(['commit', '-qm', 'remove input']);
  assert.equal(f.run().status, 1);
});
test('missing objects, invalid hashes and mismatched current revisions build', t => {
  const f = fixture(t); f.commit('docs/guide.md', 'guide');
  for (const [previous, current] of [['a'.repeat(40), undefined], ['HEAD~1', undefined], ['$(touch compromised)', undefined], [f.before, f.before]]) {
    const result = current === undefined ? f.run(previous) : f.run(previous, current);
    assert.equal(result.status, 1);
  }
});
test('no Git checkout fails open to build without disclosing command errors', t => {
  const f = fixture(t); rmSync(path.join(f.root, '.git'), { recursive: true, force: true });
  const result = spawnSync(process.execPath, [command], { cwd: f.root, encoding: 'utf8', env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: f.before } });
  assert.equal(result.status, 1); assert.match(result.stdout, /unavailable/); assert.equal(result.stderr, '');
});
