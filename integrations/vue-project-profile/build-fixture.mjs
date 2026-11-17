/** Build only the two reviewed synthetic import roots; never load target config. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';

const require = createRequire(import.meta.url);
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const allowed = new Set(['project-profile-vue', 'track-reorder-vue']);
async function sources(root, prefix = '') {
  const result = {};
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (['dist', 'node_modules'].includes(entry.name)) continue;
    const relative = path.posix.join(prefix, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Fixture symlink refused: ${relative}`);
    if (entry.isDirectory()) Object.assign(result, await sources(path.join(root, entry.name), relative));
    else result[relative] = createHash('sha256').update(await readFile(path.join(root, entry.name))).digest('hex');
  }
  return result;
}
export async function buildFixture(name) {
  assert.ok(allowed.has(name), 'Unsupported fixture; use project-profile-vue or track-reorder-vue');
  const root = path.join(repo, 'examples', name), output = path.join(root, 'dist');
  for (const directory of [path.join(repo, 'examples'), root]) {
    const entry = await lstat(directory);
    assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Fixture directory must not be a symlink');
  }
  const prior = await lstat(output).catch(error => { if (error.code !== 'ENOENT') throw error; });
  assert.ok(!prior || (prior.isDirectory() && !prior.isSymbolicLink()), 'dist must be a regular directory');
  const before = await sources(root);
  try {
    await build({ configFile: false, root, base: './', logLevel: 'warn', plugins: [vue()],
      resolve: { alias: [
        { find: /^@\//, replacement: `${root}/src/` },
        { find: /^vue$/, replacement: require.resolve('vue/dist/vue.esm-bundler.js') },
        { find: /^pinia$/, replacement: require.resolve('pinia/dist/pinia.mjs') },
      ] }, build: { outDir: output, emptyOutDir: true } });
  } catch (error) {
    await rm(output, { recursive: true, force: true });
    throw error;
  } finally {
    assert.deepEqual(await sources(root), before, 'Build must not change fixture source files');
  }
  return { fixture: name, output, sourceFiles: Object.keys(before).length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3, 'Usage: build-fixture.mjs <fixture-name>');
  console.log(JSON.stringify(await buildFixture(process.argv[2])));
}
