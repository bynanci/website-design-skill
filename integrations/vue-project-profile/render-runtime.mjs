/** Production browser evidence and comparable static/dynamic recovery costs. */
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { artifactRoot, toolRoot, fixtureServer, launchBrowser, runtimeVersions, sourceDigests, sha256 } from './browser-harness.mjs';

const root = path.resolve(toolRoot, '../../examples/media-library-vue');
const original = await sourceDigests(root);
const budgets = { maxPayloadBytes: 8192, steadyOpenP95Ms: 250, gzipJsOverheadBytes: 65536, warmups: 2, samples: 20 };
const dynamic = await fixtureServer(root, 'recovery-dynamic');
const baseline = await fixtureServer(root, 'recovery-static', { staticRecovery: true });
let browser;
const cases = [];
const errors = [];
const externalRequests = [];
async function bundle(name) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(filename);
      else if (/\.(js|css)$/.test(entry.name)) {
        const bytes = await readFile(filename);
        files.push({ path: path.relative(path.join(artifactRoot, `${name}-dist`), filename), bytes: bytes.length, gzipBytes: gzipSync(bytes).length, sha256: sha256(bytes), kind: entry.name.endsWith('.js') ? 'js' : 'css' });
      }
    }
  }
  await visit(path.join(artifactRoot, `${name}-dist`));
  return { files, jsBytes: files.filter(x => x.kind === 'js').reduce((a, b) => a + b.bytes, 0), gzipJsBytes: files.filter(x => x.kind === 'js').reduce((a, b) => a + b.gzipBytes, 0), cssBytes: files.filter(x => x.kind === 'css').reduce((a, b) => a + b.bytes, 0) };
}
const bundles = { static: await bundle('recovery-static'), dynamic: await bundle('recovery-dynamic') };
const gzipDelta = bundles.dynamic.gzipJsBytes - bundles.static.gzipJsBytes;
assert.ok(gzipDelta <= budgets.gzipJsOverheadBytes, 'Dynamic validation/host bundle exceeds the declared overhead budget');
async function prepare(mode = 'valid', { staticPanel = false, privateData = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 800, height: 620 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(String(error)));
  const origin = new URL(staticPanel ? baseline.url : dynamic.url).origin;
  page.on('request', request => { if (!request.url().startsWith(origin + '/')) externalRequests.push(request.url()); });
  await page.addInitScript(({ mode }) => {
    globalThis.__MEDIA_TEST_CONTROL__ = true;
    globalThis.__RECOVERY_INPUTS__ = [];
    globalThis.__RECOVERY_TIMEOUT_MS__ = mode === 'timeout' ? 25 : 500;
    if (mode === 'unavailable') return;
    globalThis.__RECOVERY_GENERATOR__ = (input, { signal }) => {
      globalThis.__RECOVERY_INPUTS__.push(JSON.parse(JSON.stringify(input)));
      const payload = {
        schemaVersion: 'ui-panel/0.1', registryVersion: 'media-recovery/0.1',
        requestId: input.requestId, stateVersion: input.stateVersion, expiresAfterMs: mode === 'expired' ? 1 : 30000,
        nodes: [{ type: 'Group', props: { label: 'Safe recovery' }, children: [
          { type: 'Notice', props: { tone: 'warning', title: 'Suggested recovery', text: mode === 'text-html' ? '<img src="https://invalid.example/a" onerror="globalThis.__INJECTED__=true">' : 'Use the existing read owner. No media is modified.' } },
          { type: 'ActionButton', props: { label: 'Retry media read' }, action: { id: 'retryMediaRead', params: {} } },
        ] }],
      };
      if (mode === 'invalid-html') payload.nodes[0].children[0].props.html = '<script>globalThis.__INJECTED__=true</script>';
      if (mode === 'invalid-action') payload.nodes[0].children[1].action.id = 'deleteMedia';
      if (mode === 'oversized') return ' '.repeat(10000);
      if (mode === 'timeout') return new Promise(() => {});
      if (mode === 'late') return new Promise(resolve => { globalThis.__RECOVERY_RESOLVE__ = () => resolve(JSON.stringify(payload)); });
      return JSON.stringify(payload);
    };
  }, { mode });
  await page.goto(staticPanel ? baseline.url : dynamic.url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(globalThis.__MEDIA_FIXTURE__ && globalThis.__RECOVERY_FIXTURE__));
  if (privateData) {
    await page.evaluate(() => __MEDIA_FIXTURE__.resolve(1, { items: [{ id: 'private-id', name: 'PRIVATE_CLIENT_NAME', duration: '00:01' }], partial: false }));
    await page.waitForFunction(() => __MEDIA_FIXTURE__.snapshot().status === 'success');
    await page.evaluate(() => { __MEDIA_FIXTURE__.setFilter('PRIVATE_FILTER_TOKEN'); __MEDIA_FIXTURE__.load(); });
    await page.evaluate(() => __MEDIA_FIXTURE__.reject(2, 'unavailable'));
  } else await page.evaluate(() => __MEDIA_FIXTURE__.reject(1, 'unavailable'));
  await page.waitForFunction(() => __MEDIA_FIXTURE__.snapshot().status === 'error');
  return page;
}
const view = page => page.evaluate(() => __RECOVERY_FIXTURE__.view());
const requestCount = page => page.evaluate(() => __MEDIA_FIXTURE__.requests().length);
async function open(page, mode) {
  const previous = (await view(page)).requestId;
  await page.locator('[data-testid="recovery-open"]').click();
  await page.waitForFunction(({mode, previous}) => { const value=__RECOVERY_FIXTURE__.view(); return value.mode === mode && value.requestId !== previous; }, {mode, previous});
  assert.equal(await page.locator('dialog.recovery-dialog').evaluate(e => e.open), true);
}
async function token(page) {
  return page.evaluate(() => {
    const visit = nodes => nodes.flatMap(node => node.type === 'Group' ? visit(node.children) : node.type === 'ActionButton' ? [node.action.token] : []);
    return visit(__RECOVERY_FIXTURE__.view().nodes)[0];
  });
}
async function capture(page, name, extra = {}) {
  const screenshot = `runtime-${name}.png`;
  await page.screenshot({ path: path.join(artifactRoot, screenshot), fullPage: true });
  cases.push({ name, view: await view(page), owner: await page.evaluate(() => __MEDIA_FIXTURE__.snapshot()), ownerRequests: await requestCount(page), screenshot,
    screenshotSha256: sha256(await readFile(path.join(artifactRoot, screenshot))), ...extra });
}
const summary = samples => {
  const sorted = [...samples].sort((a, b) => a - b);
  return { samples, count: samples.length, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.ceil(sorted.length * .95) - 1], minMs: sorted[0], maxMs: sorted.at(-1) };
};
async function measureOpen(staticPanel) {
  const page = await prepare('valid', { staticPanel });
  const samples = [];
  const cold = await page.evaluate(async () => { const start = performance.now(); await __RECOVERY_FIXTURE__.open(); return performance.now() - start; });
  await page.evaluate(() => __RECOVERY_FIXTURE__.dismiss());
  for (let i = 0; i < budgets.warmups + budgets.samples; i++) {
    const elapsed = await page.evaluate(async () => { const start = performance.now(); await __RECOVERY_FIXTURE__.open(); return performance.now() - start; });
    assert.equal((await view(page)).mode, staticPanel ? 'static' : 'generated');
    await page.evaluate(() => __RECOVERY_FIXTURE__.dismiss());
    if (i >= budgets.warmups) samples.push(elapsed);
  }
  const result = { coldOpenMs: cold, ...summary(samples), producerCalls: staticPanel ? 0 : await page.evaluate(() => __RECOVERY_FIXTURE__.metrics().producerCalls),
    generation: staticPanel ? 'none' : 'trusted local deterministic serialized-JSON producer; no network inference' };
  assert.ok(result.p95Ms <= budgets.steadyOpenP95Ms);
  await page.close();
  return result;
}
try {
  if (process.argv.includes('--build-only')) {
    await writeFile(path.join(artifactRoot, 'runtime-build-summary.json'), JSON.stringify({ bundles, gzipDelta, budgets, browser: 'not-run' }, null, 2) + '\n');
    console.log('Static and dynamic production builds passed; no browser claim.');
  } else {
    browser = await launchBrowser();
    const page = await prepare('valid', { privateData: true });
    await open(page, 'generated');
    const inputs = await page.evaluate(() => __RECOVERY_INPUTS__);
    assert.equal(inputs.length, 1);
    assert.deepEqual(Object.keys(inputs[0].context).sort(), ['errorCode', 'hasUsableData', 'retryAllowed']);
    assert.ok(!JSON.stringify(inputs).includes('PRIVATE_'));
    assert.ok(!JSON.stringify(inputs).includes('private-id'));
    const firstToken = await token(page);
    await capture(page, 'generated-redacted', { producerInputs: inputs });
    await page.locator('[data-testid="recovery-close"]').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('[data-testid="recovery-action"]').evaluate(e => e === document.activeElement), true);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => __MEDIA_FIXTURE__.pending().includes(3));
    assert.equal(await page.locator('dialog.recovery-dialog').evaluate(e => e.open), false);
    await page.waitForFunction(() => document.activeElement?.dataset.testid === 'media-load');
    const replay = await page.evaluate(t => __RECOVERY_FIXTURE__.activate(t), firstToken);
    assert.equal(replay.status, 'refused');
    assert.equal(await requestCount(page), 3);
    await page.evaluate(() => __MEDIA_FIXTURE__.resolve(3, { items: [], partial: false }));
    await page.close();

    const literal = await prepare('text-html');
    await open(literal, 'generated');
    assert.equal(await literal.locator('.recovery-dialog img, .recovery-dialog script, .recovery-dialog iframe').count(), 0);
    assert.equal(await literal.evaluate(() => globalThis.__INJECTED__ === undefined), true);
    assert.ok((await literal.locator('.recovery-notice').inner_text()).includes('<img'));
    await capture(literal, 'literal-text-escaped');
    await literal.keyboard.press('Escape');
    assert.equal(await literal.locator('[data-testid="recovery-open"]').evaluate(e => e === document.activeElement), true);
    await literal.close();

    for (const [mode, reason] of [['invalid-html', 'invalid-payload'], ['invalid-action', 'invalid-payload'], ['oversized', 'invalid-payload'], ['timeout', 'timeout'], ['unavailable', 'unavailable']]) {
      const fallback = await prepare(mode);
      await open(fallback, 'static');
      assert.equal((await view(fallback)).reason, reason);
      assert.equal(await fallback.locator('[data-testid="recovery-action"]').count(), 1);
      assert.equal(await fallback.evaluate(() => globalThis.__INJECTED__ === undefined), true);
      await capture(fallback, `fallback-${mode}`);
      if (mode === 'unavailable') {
        await fallback.locator('[data-testid="recovery-close"]').focus();
        await fallback.keyboard.press('Tab');
        await fallback.keyboard.press('Space');
        assert.equal(await requestCount(fallback), 2);
        await fallback.waitForFunction(() => document.activeElement?.dataset.testid === 'media-load');
      } else await fallback.keyboard.press('Escape');
      await fallback.close();
    }

    const expired = await prepare('expired');
    await open(expired, 'generated');
    const expiring = await token(expired);
    await expired.waitForTimeout(20);
    assert.equal((await expired.evaluate(t => __RECOVERY_FIXTURE__.activate(t), expiring)).status, 'refused');
    assert.equal(await requestCount(expired), 1);
    assert.equal((await view(expired)).mode, 'static');
    await capture(expired, 'expired-action');
    await expired.close();

    const denied = await prepare('valid');
    await open(denied, 'generated');
    const staleToken = await token(denied);
    await denied.evaluate(() => __MEDIA_FIXTURE__.load());
    await denied.evaluate(() => __MEDIA_FIXTURE__.reject(2, 'permission_denied'));
    await denied.waitForFunction(() => __MEDIA_FIXTURE__.snapshot().error?.code === 'permission_denied');
    assert.equal((await denied.evaluate(t => __RECOVERY_FIXTURE__.activate(t), staleToken)).status, 'refused');
    await open(denied, 'static');
    assert.equal(await denied.locator('[data-testid="recovery-action"]').count(), 0);
    assert.equal(await requestCount(denied), 2);
    await capture(denied, 'live-permission-denied');
    await denied.close();

    const late = await prepare('late');
    await late.locator('[data-testid="recovery-open"]').click();
    await late.waitForFunction(() => Boolean(globalThis.__RECOVERY_RESOLVE__));
    await late.keyboard.press('Escape');
    await late.evaluate(() => __RECOVERY_RESOLVE__());
    await late.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    assert.equal((await view(late)).mode, 'dismissed');
    assert.equal(await requestCount(late), 1);
    await capture(late, 'late-generation-dismissed');
    await late.close();

    const unmounted = await prepare('valid');
    await unmounted.evaluate(() => { document.querySelector('[data-testid="recovery-open"]').click(); __MEDIA_FIXTURE__.unmount(); });
    await unmounted.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    assert.equal(await unmounted.locator('dialog.recovery-dialog').count(), 0);
    cases.push({ name: 'unmount-during-next-tick', dialogCount: 0 });
    await unmounted.close();

    const cost = { static: await measureOpen(true), dynamic: await measureOpen(false) };
    assert.deepEqual(errors, []);
    assert.deepEqual(externalRequests, []);
    assert.deepEqual(await sourceDigests(root), original);
    const report = { evidenceVersion: '0.1', passed: true, capturedAt: new Date().toISOString(), runtime: await runtimeVersions(browser),
      sourceDigests: original, githubActions: { runId: process.env.GITHUB_RUN_ID ?? null, checkoutSha: process.env.GITHUB_SHA ?? null },
      toolDigests: Object.fromEntries(await Promise.all(['render-runtime.mjs', 'browser-harness.mjs', 'package-lock.json'].map(async f => [f, sha256(await readFile(path.join(toolRoot, f)))]))),
      budgets, bundles, gzipJsOverheadBytes: gzipDelta, latency: cost,
      measurement: 'Same production fixture and runtime; static component substituted by a fixed harness alias. Cold open separate; 2 warmups then 20 steady open-to-Vue-DOM-commit samples. No performance improvement claim.',
      model: { producer: 'trusted local deterministic fixture', externalCalls: 0, fixtureInferenceCost: 0, liveModelLatencyMs: null, liveModelMonetaryCost: null, reason: 'No live or paid model was called.' },
      hostBoundary: 'Same-origin JS validation and host-owned capabilities; not a process sandbox. The only registered action delegates to the existing media retry owner, which independently checks its current state.',
      checks: { strictPayloadAndTextRendering: 'passed', liveAuthorizationReplayExpiry: 'passed', staticRecovery: 'passed', nativeKeyboardFocus: 'passed', cancellationUnmount: 'passed', minimizedInput: 'passed', productionBuilds: 'passed', declaredCostBudgets: 'passed', sourcesPreserved: 'passed', runtimeErrors: errors },
      cases, unrun: ['Live model transport/inference cost and latency', 'Process isolation', 'Remote assets (no asset component is registered)', 'Screen readers, physical touch/keyboard and native shell'],
    };
    await writeFile(path.join(artifactRoot, 'runtime-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(`Runtime recovery: ${cases.length} browser records, static/dynamic cost observations and declared gates passed.`);
  }
} catch (error) {
  await writeFile(path.join(artifactRoot, 'runtime-results.json'), JSON.stringify({ evidenceVersion: '0.1', passed: false, sourceDigests: original, cases, runtimeErrors: errors, executionError: { name: error.name, message: error.message } }, null, 2) + '\n');
  throw error;
} finally {
  await browser?.close();
  await dynamic.close();
  await baseline.close();
}
