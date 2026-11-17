/** Actual owner/service transition checks through the shared optional browser harness. */
import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { artifactRoot, toolRoot, fixtureServer, launchBrowser, runtimeVersions, sourceDigests, sha256 } from './browser-harness.mjs';

const root = path.resolve(toolRoot, '../../examples/media-library-vue');
const original = await sourceDigests(root);
const server = await fixtureServer(root, 'media');
let browser;
const cases = [];
const errors = [];
const items = [
  { id: 'clip-1', name: 'Harbor arrival', duration: '00:12' },
  { id: 'clip-2', name: 'Evening walk', duration: '00:18' },
];
async function pageFor() {
  const page = await browser.newPage({ viewport: { width: 800, height: 620 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(String(error)));
  await page.addInitScript(() => { globalThis.__MEDIA_TEST_CONTROL__ = true; });
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => globalThis.__MEDIA_FIXTURE__?.pending().length === 1);
  return page;
}
const state = page => page.evaluate(() => __MEDIA_FIXTURE__.snapshot());
const requests = page => page.evaluate(() => __MEDIA_FIXTURE__.requests());
async function settle(page, id, result) {
  await page.evaluate(({ id, result }) => __MEDIA_FIXTURE__.resolve(id, result), { id, result });
  await page.waitForFunction(() => __MEDIA_FIXTURE__.snapshot().status === 'success');
}
async function fail(page, id, code = 'unavailable') {
  await page.evaluate(({ id, code }) => __MEDIA_FIXTURE__.reject(id, code), { id, code });
  await page.waitForFunction(() => __MEDIA_FIXTURE__.snapshot().status === 'error');
}
async function capture(page, name) {
  const screenshot = `media-${name}.png`;
  await page.screenshot({ path: path.join(artifactRoot, screenshot), fullPage: true });
  cases.push({ name, state: await state(page), requests: await requests(page), screenshot,
    screenshotSha256: sha256(await readFile(path.join(artifactRoot, screenshot))) });
}
try {
  browser = await launchBrowser();
  const page = await pageFor();
  assert.equal((await state(page)).status, 'loading');
  assert.equal(await page.locator('[data-testid="media-panel"]').getAttribute('aria-busy'), 'true');
  await capture(page, 'initial-loading');
  await settle(page, 1, { items: [], partial: false });
  assert.equal(await page.locator('[data-testid="media-empty"]').count(), 1);
  await capture(page, 'empty');
  const recovery = page.locator('[data-testid="media-load"]');
  await recovery.click();
  await fail(page, 2);
  assert.equal(await page.getByRole('alert').count(), 1);
  await capture(page, 'retryable-error');
  await recovery.focus();
  await recovery.press('Enter');
  assert.equal(await recovery.evaluate(element => element === document.activeElement), true);
  assert.equal((await state(page)).status, 'loading');
  await recovery.press('Enter'); // Duplicate read intent coalesces at the existing owner.
  assert.equal((await requests(page)).length, 3);
  await settle(page, 3, { items, partial: false });
  assert.equal(await recovery.evaluate(element => element === document.activeElement), true);
  await page.locator('input[value="clip-2"]').check();
  await page.locator('[data-testid="media-filter"]').fill('Evening');
  await capture(page, 'success');
  await recovery.click();
  assert.equal((await state(page)).status, 'refreshing');
  await capture(page, 'background-refresh');
  await fail(page, 4);
  const preserved = await state(page);
  assert.deepEqual(preserved.items, items);
  assert.equal(preserved.selectedId, 'clip-2');
  assert.equal(preserved.filter, 'Evening');
  assert.equal(await page.locator('input[value="clip-2"]').isChecked(), true);
  assert.equal(await page.locator('[data-testid="media-filter"]').inputValue(), 'Evening');
  await capture(page, 'failed-refresh-preserves-data');
  await recovery.press('Space');
  await settle(page, 5, { items, partial: true });
  assert.equal((await state(page)).partial, true);
  assert.equal(await recovery.evaluate(element => element === document.activeElement), true);
  assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
  const motion = await page.locator('[data-testid="media-panel"]').evaluate(element => {
    const style = getComputedStyle(element); return { animation: style.animationName, transition: style.transitionDuration };
  });
  assert.deepEqual(motion, { animation: 'none', transition: '0s' });
  await capture(page, 'partial-recovery');
  await page.close();

  const denied = await pageFor();
  await fail(denied, 1, 'permission_denied');
  const deniedButton = denied.locator('[data-testid="media-load"]');
  assert.equal(await deniedButton.getAttribute('aria-disabled'), 'true');
  await deniedButton.focus();
  await deniedButton.press('Enter');
  // Deliberately bypass actionability to test the owner guard on a forbidden click.
  await deniedButton.click({ force: true });
  assert.equal((await requests(denied)).length, 1);
  assert.equal((await state(denied)).error.retryable, false);
  await capture(denied, 'non-retryable-permission');
  await denied.close();

  const race = await pageFor();
  await race.evaluate(() => __MEDIA_FIXTURE__.load({ replace: true }));
  assert.equal((await requests(race))[0].aborted, true);
  await settle(race, 2, { items, partial: false });
  await race.evaluate(() => __MEDIA_FIXTURE__.resolve(1, { items: [{ id: 'stale', name: 'Stale', duration: '00:01' }], partial: false }));
  await race.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.deepEqual((await state(race)).items, items);
  await capture(race, 'newer-response-wins');
  await race.close();

  const cancelled = await pageFor();
  await cancelled.locator('[data-testid="media-cancel"]').click();
  const afterCancel = await state(cancelled);
  assert.equal(afterCancel.status, 'idle');
  await cancelled.evaluate(() => __MEDIA_FIXTURE__.resolve(1, { items: [{ id: 'late', name: 'Late', duration: '00:01' }], partial: false }));
  await cancelled.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  assert.deepEqual(await state(cancelled), afterCancel);
  await capture(cancelled, 'cancel-ignores-late-response');
  await cancelled.close();

  const unmounted = await pageFor();
  await unmounted.evaluate(() => __MEDIA_FIXTURE__.unmount());
  const afterUnmount = await state(unmounted);
  await unmounted.evaluate(() => __MEDIA_FIXTURE__.resolve(1, { items: [{ id: 'late', name: 'Late', duration: '00:01' }], partial: false }));
  await unmounted.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  assert.deepEqual(await state(unmounted), afterUnmount);
  assert.equal(await unmounted.locator('[data-testid="media-panel"]').count(), 0);
  cases.push({ name: 'unmount-ignores-late-response', state: await state(unmounted), requests: await requests(unmounted), domPanelCount: 0 });
  await unmounted.close();

  assert.deepEqual(errors, []);
  assert.deepEqual(await sourceDigests(root), original);
  const result = {
    evidenceVersion: '0.1', passed: true, capturedAt: new Date().toISOString(), sourceDigests: original,
    command: 'node integrations/vue-project-profile/render-media.mjs',
    runtime: await runtimeVersions(browser),
    githubActions: { runId: process.env.GITHUB_RUN_ID ?? null, checkoutSha: process.env.GITHUB_SHA ?? null },
    toolDigests: Object.fromEntries(await Promise.all(['render-media.mjs', 'browser-harness.mjs', 'package-lock.json'].map(async filename => [filename, sha256(await readFile(path.join(toolRoot, filename)))]))),
    checks: { productionBuild: 'passed', ownerTransitions: 'passed', keyboardRecovery: 'passed', duplicateReadCoalescing: 'passed', staleCancelUnmount: 'passed', preservedDataSelectionInput: 'passed', reducedMotion: 'passed', readOnlySources: 'passed', runtimeErrors: errors },
    cases,
    unrun: ['Native media services', 'Real network permission changes', 'Side-effecting writes (the fixture service is read-only)', 'Screen readers and physical touch devices', 'Full dashboard visual matrix owned by Issue #7'],
  };
  await writeFile(path.join(artifactRoot, 'media-results.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`${cases.length} rendered transition cases passed.`);
} catch (error) {
  await writeFile(path.join(artifactRoot, 'media-results.json'), JSON.stringify({
    evidenceVersion: '0.1', passed: false, capturedAt: new Date().toISOString(),
    sourceDigests: original, runtimeErrors: errors, cases,
    executionError: { name: error.name, message: error.message },
    notes: ['Execution did not complete; absent assertions are not passing evidence.'],
  }, null, 2) + '\n');
  throw error;
} finally {
  await browser?.close();
  await server.close();
}
