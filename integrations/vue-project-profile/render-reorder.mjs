/** Verify the bounded patch on an exclusive temporary copy through native events. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { artifactRoot, toolRoot, fixtureServer, launchBrowser, runtimeVersions, sourceDigests, sha256 } from './browser-harness.mjs';
import { proposeReorder, applyReorder, rollbackReorder, typeCheckReorder } from './patch.mjs';

const root = path.resolve(toolRoot, '../../examples/track-reorder-vue');
const original = await sourceDigests(root);
const temporary = await mkdtemp(path.join(os.tmpdir(), 'track-browser-'));
const candidate = path.join(temporary, 'track-reorder-vue');
await cp(root, candidate, { recursive: true });
const target = 'src/components/TrackReorder.vue';
const before = await readFile(path.join(candidate, target));
let browser;
let server;
const errors = [];
const samples = [];
const initialOrder = ['track-a', 'track-b', 'track-c'];
const snapshot = page => page.evaluate(() => __TRACK_FIXTURE__.snapshot());
async function capture(page, name) {
  const screenshot = `reorder-${name}.png`;
  await page.screenshot({ path: path.join(artifactRoot, screenshot), fullPage: true });
  samples.push({ name, state: await snapshot(page), screenshot,
    screenshotSha256: sha256(await readFile(path.join(artifactRoot, screenshot))) });
}
async function loadPage() {
  const page = await browser.newPage({ viewport: { width: 800, height: 420 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(globalThis.__TRACK_FIXTURE__));
  return page;
}
try {
  browser = await launchBrowser();
  server = await fixtureServer(candidate, 'reorder-baseline');
  const baseline = await loadPage();
  await baseline.getByRole('button', { name: 'Move track up' }).click();
  assert.deepEqual((await snapshot(baseline)).order, initialOrder);
  assert.equal((await snapshot(baseline)).persistenceWrites, 0);
  await capture(baseline, 'baseline');
  await baseline.close();
  await server.close(); server = undefined;

  const plan = proposeReorder(candidate, { expectedSha256: sha256(before) });
  assert.equal(plan.status, 'proposed');
  const typeCheck = typeCheckReorder(candidate, plan);
  assert.equal(typeCheck.status, 'passed');
  assert.equal(applyReorder(candidate, plan, { exclusiveWorkspace: true }).status, 'applied');
  const after = await readFile(path.join(candidate, target));
  const repeated = proposeReorder(candidate, { expectedSha256: sha256(after) });
  assert.equal(repeated.status, 'no-op');
  assert.equal(applyReorder(candidate, repeated, { exclusiveWorkspace: true }).status, 'no-op');
  const candidateDigests = await sourceDigests(candidate);
  for (const [filename, digest] of Object.entries(original)) if (filename !== target) assert.equal(candidateDigests[filename], digest, `Protected bytes changed: ${filename}`);

  server = await fixtureServer(candidate, 'reorder-candidate');
  const page = await loadPage();
  const up = page.getByRole('button', { name: 'Move track up' });
  const down = page.getByRole('button', { name: 'Move track down' });
  await up.click();
  const first = await snapshot(page);
  assert.deepEqual(first.order, ['track-b', 'track-a', 'track-c']);
  assert.equal(first.persistenceWrites, 1);
  assert.deepEqual(first.persistedOrders, [['track-b', 'track-a', 'track-c']]);
  assert.equal(first.selectedTrackId, 'track-b');
  assert.equal(first.playhead, 125);
  await capture(page, 'pointer-up');
  await up.focus();
  await up.press('Enter'); // First item: existing boundary rejects an out-of-range move.
  assert.equal((await snapshot(page)).persistenceWrites, 1);
  assert.equal(await up.evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await down.evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Space');
  const keyboard = await snapshot(page);
  assert.deepEqual(keyboard.order, initialOrder);
  assert.equal(keyboard.persistenceWrites, 2);
  assert.equal(keyboard.selectedTrackId, 'track-b');
  assert.equal(keyboard.playhead, 125);
  assert.equal(await down.evaluate(element => element === document.activeElement), true);
  await capture(page, 'keyboard-space-down');
  await page.keyboard.press('Enter');
  const end = await snapshot(page);
  assert.deepEqual(end.order, ['track-a', 'track-c', 'track-b']);
  assert.equal(end.persistenceWrites, 3);
  await page.keyboard.press('Enter');
  assert.deepEqual(await snapshot(page), end);
  await capture(page, 'keyboard-enter-and-boundary');
  await page.close();
  await server.close(); server = undefined;
  assert.equal(rollbackReorder(candidate, plan, { exclusiveWorkspace: true }).status, 'rolled-back');
  assert.deepEqual(await readFile(path.join(candidate, target)), before);
  assert.deepEqual(await sourceDigests(root), original);
  assert.deepEqual(errors, []);
  const result = {
    evidenceVersion: '0.1', passed: true, capturedAt: new Date().toISOString(),
    command: 'node integrations/vue-project-profile/render-reorder.mjs',
    runtime: await runtimeVersions(browser), sourceDigests: original, candidateSourceDigests: candidateDigests,
    githubActions: { runId: process.env.GITHUB_RUN_ID ?? null, checkoutSha: process.env.GITHUB_SHA ?? null },
    toolDigests: Object.fromEntries(await Promise.all(['render-reorder.mjs', 'browser-harness.mjs', 'patch.mjs', 'package-lock.json'].map(async filename => [filename, sha256(await readFile(path.join(toolRoot, filename)))]))),
    checks: { baselineNoHandler: 'passed', proposedRanges: 'passed', typeCheck: 'passed', productionBuild: 'passed', pointerEvent: 'passed', nativeKeyboard: 'passed', sideEffectCounts: 'passed', selectionPlayhead: 'passed', idempotence: 'passed', rollback: 'passed', originalSourcesPreserved: 'passed', runtimeErrors: errors },
    plan, samples,
    hostPrecondition: 'Application and rollback run only in an exclusive temporary fixture copy; cooperative locks do not protect against arbitrary noncooperating editors.',
    unrun: ['Native media/FFmpeg services', 'Physical keyboard and assistive technology', 'Other component or owner source forms', 'Concurrent noncooperating writers outside the exclusive-workspace contract'],
  };
  await writeFile(path.join(artifactRoot, 'reorder-results.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log('Baseline, applied native events, side-effect counts, no-op reapplication and rollback passed.');
} catch (error) {
  await writeFile(path.join(artifactRoot, 'reorder-results.json'), JSON.stringify({
    evidenceVersion: '0.1', passed: false, capturedAt: new Date().toISOString(),
    sourceDigests: original, runtimeErrors: errors, samples,
    executionError: { name: error.name, message: error.message },
    notes: ['Execution did not complete; absent assertions are not passing evidence.'],
  }, null, 2) + '\n');
  throw error;
} finally {
  await server?.close();
  await browser?.close();
  await rm(temporary, { recursive: true, force: true });
}
