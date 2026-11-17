import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildFixture } from './build-fixture.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function trackedHashes(root) {
  const names = execFileSync('git', ['ls-files', '-z', '--', root], { cwd: repo }).toString().split('\0').filter(Boolean);
  return Object.fromEntries(await Promise.all(names.map(async name => [name,
    createHash('sha256').update(await readFile(path.join(repo, name))).digest('hex')])));
}
for (const name of ['project-profile-vue', 'track-reorder-vue']) {
  test(`${name} builds real entry/assets without changing tracked source`, async () => {
    const before = await trackedHashes(`examples/${name}`);
    const result = await buildFixture(name);
    assert.deepEqual(await trackedHashes(`examples/${name}`), before);
    const html = await readFile(path.join(result.output, 'index.html'), 'utf8');
    const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g)].map(match => match[1]);
    assert.ok(assets.some(asset => asset.endsWith('.js')), 'compiled application entry required');
    assert.ok(assets.some(asset => asset.endsWith('.css')), 'compiled styles required');
    for (const asset of assets) assert.ok((await stat(path.join(result.output, asset))).size > 0);
    assert.ok(!html.includes('/src/'), 'public entry must reference compiled assets');
  });
}
test('paths and unreviewed fixture names are refused before building', async () => {
  for (const name of ['/tmp/external-fixture', '../project-profile-vue', 'media-library-vue', '']) {
    await assert.rejects(buildFixture(name), /Unsupported fixture/);
  }
});
