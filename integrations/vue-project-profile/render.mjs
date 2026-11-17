/** Build and inspect the bounded profile fixture without executing its configuration. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';
import vue from '@vitejs/plugin-vue';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(process.argv[2] ?? path.join(toolRoot, '../../examples/project-profile-vue'));
const output = path.join(toolRoot, 'artifacts');
const expected = {
  light: { warning: 'rgb(138, 90, 0)', destructive: 'rgb(164, 35, 50)', surface: 'rgb(255, 255, 255)', foreground: 'rgb(23, 32, 42)' },
  dark: { warning: 'rgb(242, 198, 109)', destructive: 'rgb(255, 139, 146)', surface: 'rgb(22, 26, 31)', foreground: 'rgb(241, 244, 245)' },
};

async function hashes(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = {};
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (['node_modules', 'evidence', 'artifacts', 'dist', 'expected-profile.json', 'expected-source-profile.json'].includes(entry.name) || entry.name.endsWith('.md')) continue;
    const relative = path.posix.join(prefix, entry.name);
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Fixture symlink is unsupported: ${relative}`);
    if (entry.isDirectory()) Object.assign(result, await hashes(filename, relative));
    else if (entry.isFile()) result[relative] = createHash('sha256').update(await readFile(filename)).digest('hex');
  }
  return result;
}

function contrast(a, b) {
  const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [first, second] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Number(((first + 0.05) / (second + 0.05)).toFixed(3));
}

const versions = {};
for (const name of ['vue', '@vue/compiler-sfc', 'pinia', 'typescript', 'sass', 'vite', '@vitejs/plugin-vue', 'playwright']) {
  let filename;
  try { filename = require.resolve(`${name}/package.json`); }
  catch { filename = path.join(toolRoot, 'node_modules', name, 'package.json'); }
  versions[name] = JSON.parse(await readFile(filename, 'utf8')).version;
}
const before = await hashes(projectRoot);
await mkdir(output, { recursive: true });
// This reviewed harness uses a fixed build configuration. Target vite.config.ts is never evaluated.
const config = {
  configFile: false,
  root: projectRoot,
  logLevel: 'warn',
  plugins: [vue()],
  resolve: { alias: [
    { find: /^@\//, replacement: `${projectRoot}/src/` },
    { find: /^vue$/, replacement: require.resolve('vue/dist/vue.esm-bundler.js') },
    { find: /^pinia$/, replacement: require.resolve('pinia/dist/pinia.mjs') },
  ] },
  build: { outDir: path.join(output, 'dist'), emptyOutDir: true },
};
await build(config);
const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0, strictPort: false, open: false } });
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
  headless: true,
});
const errors = [];
const samples = [];
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 420 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(server.resolvedUrls.local[0], { waitUntil: 'networkidle' });
  await page.locator('[data-kind="warning"]').waitFor();
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    const measurements = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return [...document.querySelectorAll('.status-banner')].map(element => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return {
          kind: element.dataset.kind,
          text: element.textContent.trim(),
          role: element.getAttribute('role'),
          border: style.borderInlineStartColor,
          foreground: style.color,
          background: style.backgroundColor,
          tokens: Object.fromEntries(['--color-warning', '--color-destructive', '--surface', '--foreground'].map(name => [name, root.getPropertyValue(name).trim()])),
          visible: box.width > 0 && box.height > 0,
        };
      });
    });
    assert.equal(measurements.length, 2, 'Both semantic consumers must render');
    const warning = measurements.find(item => item.kind === 'warning');
    const destructive = measurements.find(item => item.kind === 'destructive');
    assert.equal(warning.border, expected[theme].warning);
    assert.equal(destructive.border, expected[theme].destructive);
    assert.notEqual(warning.border, destructive.border);
    for (const item of measurements) {
      assert.equal(item.background, expected[theme].surface);
      assert.equal(item.foreground, expected[theme].foreground);
      assert.equal(item.role, 'status');
      assert.equal(item.visible, true);
      item.textContrast = contrast(item.foreground, item.background);
      item.borderContrast = contrast(item.border, item.background);
      assert.ok(item.textContrast >= 4.5);
      assert.ok(item.borderContrast >= 3);
    }
    const screenshot = `theme-${theme}.png`;
    await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
    samples.push({ theme, measurements, screenshot, screenshotSha256: createHash('sha256').update(await readFile(path.join(output, screenshot))).digest('hex') });
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  assert.deepEqual(await hashes(projectRoot), before, 'Build/render must not edit fixture sources');
  const result = {
    evidenceVersion: '0.1',
    capturedAt: new Date().toISOString(),
    scope: 'Synthetic Vue status-component token consumers; production build with reviewed harness configuration',
    command: 'node integrations/vue-project-profile/render.mjs examples/project-profile-vue',
    browserExecutable: process.env.CHROMIUM_EXECUTABLE_PATH || 'Playwright-managed Chromium',
    githubActions: { runId: process.env.GITHUB_RUN_ID ?? null, checkoutSha: process.env.GITHUB_SHA ?? null, runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null },
    runtime: { node: process.version, chromium: browser.version(), packages: versions },
    sourceDigests: before,
    toolDigests: Object.fromEntries(await Promise.all(['render.mjs', 'package-lock.json'].map(async name => [name, createHash('sha256').update(await readFile(path.join(toolRoot, name))).digest('hex')]))),
    checks: { productionBuild: 'passed', themes: 'passed', distinctSemanticConsumers: 'passed', textContrast: 'passed', borderContrast: 'passed', readOnlySources: 'passed', runtimeErrors: errors },
    contrastMethod: 'WCAG relative luminance formula applied to browser computed RGB pairs; thresholds 4.5 text and 3 status border',
    samples,
    unrun: ['Target Vite dynamic configuration', 'Tailwind or Sass module graphs outside the supported fixture', 'Visual quality acceptance beyond these captures', 'Full dashboard, browser zoom, screen reader, touch, native shell, performance and cross-agent release evaluation'],
  };
  await writeFile(path.join(output, 'render-results.json'), `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`Production build and ${samples.length} rendered themes passed. Evidence: integrations/vue-project-profile/artifacts/render-results.json\n`);
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
