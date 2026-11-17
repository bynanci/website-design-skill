/** Shared production-build/browser harness for isolated interaction fixtures. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';
import vue from '@vitejs/plugin-vue';
import { chromium } from 'playwright';

export const require = createRequire(import.meta.url);
export const toolRoot = path.dirname(fileURLToPath(import.meta.url));
export const artifactRoot = path.join(toolRoot, 'artifacts');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export async function sourceDigests(root, prefix = '') {
  const result = {};
  for (const entry of (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (['node_modules', 'artifacts', 'evidence', 'dist'].includes(entry.name) || entry.name.endsWith('.md')) continue;
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unsupported fixture symlink: ${relative}`);
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) Object.assign(result, await sourceDigests(absolute, relative));
    else if (entry.isFile()) result[relative] = sha256(await readFile(absolute));
  }
  return result;
}
export async function runtimeVersions(browser) {
  const packages = {};
  for (const name of ['vue', '@vue/compiler-sfc', 'pinia', 'typescript', 'vite', '@vitejs/plugin-vue', 'playwright']) {
    let filename;
    try { filename = require.resolve(`${name}/package.json`); }
    catch { filename = path.join(toolRoot, 'node_modules', name, 'package.json'); }
    packages[name] = JSON.parse(await readFile(filename, 'utf8')).version;
  }
  return { node: process.version, chromium: browser.version(), packages };
}
export async function fixtureServer(root, name) {
  await mkdir(artifactRoot, { recursive: true });
  const config = {
    configFile: false, root, logLevel: 'warn', plugins: [vue()],
    resolve: { alias: [
      { find: /^@\//, replacement: `${root}/src/` },
      { find: /^vue$/, replacement: require.resolve('vue/dist/vue.esm-bundler.js') },
      { find: /^pinia$/, replacement: require.resolve('pinia/dist/pinia.mjs') },
    ] },
    build: { outDir: path.join(artifactRoot, `${name}-dist`), emptyOutDir: true },
  };
  await build(config);
  const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0, strictPort: false, open: false } });
  return { url: server.resolvedUrls.local[0], close: () => new Promise(resolve => server.httpServer.close(resolve)) };
}
export async function launchBrowser() {
  return chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
}
