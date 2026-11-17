import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { digest, syntheticFailureBytes, proposeResponsiveRepair, applyResponsiveRepair, rollbackResponsiveRepair, runBoundedRepair } from './responsive.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, '../../examples/responsive-dashboard/specimen/styles.css'));
const exclusive = { exclusiveWorkspace: true };
const conditions = ['desktop', 'mobile'];
function fixture(t, bytes = source) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'responsive-repair-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'specimen')); fs.mkdirSync(path.join(root, 'qa'));
  fs.writeFileSync(path.join(root, 'specimen/styles.css'), bytes);
  fs.writeFileSync(path.join(root, 'specimen/app.js'), 'globalThis.fixture = true;\n');
  fs.writeFileSync(path.join(root, 'specimen/index.html'), '<main>Preserved content and actions</main>\n');
  const contract = {
    version: '0.1', operation: 'restore-dashboard-mix-columns', sourceRevision: '1'.repeat(40),
    target: 'specimen/styles.css', selector: '.mix-body', property: 'grid-template-columns',
    approvedValue: 'minmax(150px,1.05fr) minmax(145px,.9fr)', injectedValue: '640px 640px',
    approvedSourceSha256: digest(bytes), matrixVersion: 'dashboard-0.2-20261117', nativeZoomRequired: true, requiredConditions: conditions,
    budget: { maxIterations: 2, maxWallTimeMs: 10000, maxProcesses: 3, maxCaptures: 20 },
  };
  fs.writeFileSync(path.join(root, 'qa/repair-contract.json'), JSON.stringify(contract));
  return { root, contract, reference: { passed: true, matrixVersion: 'dashboard-0.2-20261117', nativeZoomPassed: true, failures: [], conditions, captures: 2, sourceSha256: digest(bytes) } };
}
const read = root => fs.readFileSync(path.join(root, 'specimen/styles.css'));
const propose = root => proposeResponsiveRepair(root, { expectedSha256: digest(read(root)) });
function failing(root) { fs.writeFileSync(path.join(root, 'specimen/styles.css'), syntheticFailureBytes(root)); }
function snapshot(root) {
  return fs.readdirSync(root, { recursive: true }).filter(name => fs.statSync(path.join(root, name)).isFile()).sort().map(name => [name, fs.readFileSync(path.join(root, name), 'base64')]);
}
const measurement = (root, passed, extra = {}) => ({ passed, sourceSha256: digest(read(root)), matrixVersion: 'dashboard-0.2-20261117', nativeZoomPassed: true, failures: passed ? [] : ['mobile: global horizontal overflow'], conditions, captures: 2, ...extra });
function unchanged(root, operation, pattern) {
  const before = snapshot(root); assert.throws(operation, pattern); assert.deepEqual(snapshot(root), before);
}

test('one parsed value restores the exact reviewed bytes and no-op reapplication', t => {
  const { root } = fixture(t, Buffer.from('/* preserved 中文 */\r\n' + source.toString().replaceAll('\n', '\r\n')));
  const approved = read(root); failing(root); const bad = read(root);
  const plan = propose(root);
  assert.equal(plan.edits.length, 1);
  assert.equal(plan.edits[0].before, '640px 640px');
  assert.equal(plan.parserVersions.postcss, '8.5.6');
  const start = plan.edits[0].start, end = plan.edits[0].end;
  assert.equal(bad.toString().slice(start, end), '640px 640px');
  const protectedBefore = snapshot(root).filter(([name]) => name !== 'specimen/styles.css');
  assert.equal(applyResponsiveRepair(root, plan, exclusive).status, 'applied');
  assert.deepEqual(read(root), approved);
  assert.deepEqual(snapshot(root).filter(([name]) => name !== 'specimen/styles.css'), protectedBefore);
  const repeated = propose(root);
  assert.equal(repeated.status, 'no-op');
  assert.equal(applyResponsiveRepair(root, repeated, exclusive).status, 'no-op');
  rollbackResponsiveRepair(root, plan, exclusive);
  assert.deepEqual(read(root), bad);
});

test('writes and rollback require an exclusive host workspace', t => {
  const { root } = fixture(t); failing(root); const plan = propose(root);
  unchanged(root, () => applyResponsiveRepair(root, plan), /exclusive workspace/);
  applyResponsiveRepair(root, plan, exclusive);
  unchanged(root, () => rollbackResponsiveRepair(root, plan), /exclusive workspace/);
});

test('stale target and changed contract/protected inputs refuse without mutation', t => {
  const { root } = fixture(t); failing(root); const plan = propose(root);
  unchanged(root, () => proposeResponsiveRepair(root, { expectedSha256: '0'.repeat(64) }), /Stale/);
  fs.appendFileSync(path.join(root, 'specimen/app.js'), '// concurrent change');
  unchanged(root, () => applyResponsiveRepair(root, plan, exclusive), /Tampered responsive plan/);
});

for (const [label, transform, pattern] of [
  ['duplicate rule', text => text + '\n.mix-body{grid-template-columns:640px 640px}', /one top-level/],
  ['duplicate declaration', text => text.replace('.mix-body{', '.mix-body{grid-template-columns:640px 640px;'), /one grid-template/],
  ['unexpected value', text => text.replace('640px 640px', '12px'), /Unsupported source value/],
  ['important declaration', text => text.replace('640px 640px', '640px 640px!important'), /Unsupported declaration/],
  ['unrelated hidden-content change', text => text + '\nmain{display:none}', /differs from frozen/],
  ['malformed CSS', text => text + '\n.bad{', /Unclosed block/],
]) test(`refuses ${label}`, t => {
  const { root } = fixture(t); failing(root);
  fs.writeFileSync(path.join(root, 'specimen/styles.css'), transform(read(root).toString()));
  unchanged(root, () => propose(root), pattern);
});

test('tampered candidate/edit plan cannot write arbitrary CSS', t => {
  const { root } = fixture(t); failing(root); const plan = propose(root);
  plan.after = Buffer.from('main{display:none}').toString('base64');
  unchanged(root, () => applyResponsiveRepair(root, plan, exclusive), /Tampered/);
});

test('external source symlinks and cooperating lock conflicts are refused', t => {
  const { root } = fixture(t); failing(root); const plan = propose(root);
  const lock = path.join(root, 'specimen/styles.css.responsive-repair.lock');
  fs.writeFileSync(lock, 'another operation');
  unchanged(root, () => applyResponsiveRepair(root, plan, exclusive), /EEXIST/);
  fs.unlinkSync(lock);
  const target = path.join(root, 'specimen/styles.css');
  const outside = path.join(root, 'outside.css'); fs.renameSync(target, outside); fs.symlinkSync(outside, target);
  assert.throws(() => propose(root), /Symlinked/);
});

test('rollback rejects changed target instead of overwriting a newer edit', t => {
  const { root } = fixture(t); failing(root); const plan = propose(root); applyResponsiveRepair(root, plan, exclusive);
  fs.appendFileSync(path.join(root, 'specimen/styles.css'), '\n/* concurrent */');
  unchanged(root, () => rollbackResponsiveRepair(root, plan, exclusive), /concurrent-edit conflict/);
});

test('complete failed baseline and passing candidate use the same frozen matrix', async t => {
  const { root, reference } = fixture(t); failing(root); const calls = [], preserved = [];
  const result = await runBoundedRepair({ root, reference, host: exclusive,
    measure: async args => { calls.push(args); return measurement(root,args.label !== 'failing-baseline'); },
    preserve: async record => preserved.push(record) });
  assert.equal(result.status, 'accepted'); assert.equal(result.iterations, 1); assert.equal(result.processes, 2);
  assert.deepEqual(calls.map(call => call.label), ['failing-baseline', 'candidate-1']);
  assert.equal(preserved[1].plan.edits.length, 1); assert.equal(result.selected, 'candidate-1');
  assert.equal(digest(read(root)), reference.sourceSha256);
});

test('passing baseline requires no patch or extra process', async t => {
  const { root, reference } = fixture(t); const before = snapshot(root);
  const result = await runBoundedRepair({ root, reference, host: exclusive, measure: async () => measurement(root,true) });
  assert.equal(result.status, 'no-change'); assert.equal(result.iterations, 0); assert.equal(result.processes, 1);
  assert.deepEqual(snapshot(root), before);
});

for (const [label, outcome, reason] of [
  ['candidate regression', root => measurement(root,false), 'matrix-regression-or-unresolved'],
  ['partial matrix', root => measurement(root,true, { conditions: ['mobile'] }), 'incomplete-or-invalid-matrix'],
  ['unverified native zoom', root => measurement(root,true, { nativeZoomPassed: false }), 'incomplete-or-invalid-matrix'],
  ['changed matrix version', root => measurement(root,true, { matrixVersion: 'different' }), 'incomplete-or-invalid-matrix'],
  ['capture exhaustion', root => measurement(root,true, { captures: 30 }), 'capture-budget'],
  ['stale source evidence', root => measurement(root,true, { sourceSha256: '0'.repeat(64) }), 'evidence-source-mismatch'],
  ['missing source evidence', root => measurement(root,true, { sourceSha256: undefined }), 'evidence-source-mismatch'],
]) test(`stops and rolls back on ${label}, keeping the reference`, async t => {
  const { root, reference } = fixture(t); failing(root); const original = read(root); let calls = 0;
  const result = await runBoundedRepair({ root, reference, host: exclusive, measure: async () => ++calls === 1 ? measurement(root,false) : outcome(root) });
  assert.equal(result.status, 'stopped'); assert.equal(result.reason, reason); assert.equal(result.selected, 'reference');
  assert.equal(calls, 2); assert.deepEqual(read(root), original);
});

for (const [name, change, reason, expectedProcesses] of [
  ['iteration', { maxIterations: 0 }, 'iteration-budget', 1],
  ['process', { maxProcesses: 1 }, 'process-budget', 1],
  ['capture', { maxCaptures: 2 }, 'capture-budget', 1],
]) test(`${name} budget stops before unverified writes`, async t => {
  const { root, reference, contract } = fixture(t); failing(root); const before = snapshot(root);
  const result = await runBoundedRepair({ root, reference, host: exclusive, budget: { ...contract.budget, ...change }, measure: async () => measurement(root,false) });
  assert.equal(result.reason, reason); assert.equal(result.processes, expectedProcesses); assert.equal(result.iterations, 0);
  assert.deepEqual(snapshot(root), before);
});

test('wall-time expiration after baseline prevents any candidate write', async t => {
  const { root, reference } = fixture(t); failing(root); const before = snapshot(root); let clock = 0;
  const result = await runBoundedRepair({ root, reference, host: exclusive, now: () => clock,
    measure: async () => { clock = 10001; return measurement(root,false); } });
  assert.equal(result.reason, 'wall-time-budget'); assert.equal(result.iterations, 0); assert.deepEqual(snapshot(root), before);
});

test('measurement exceptions and evidence-write failures roll back the candidate', async t => {
  for (const evidenceFailure of [false, true]) {
    const { root, reference } = fixture(t); failing(root); const bad = read(root); let calls = 0;
    const result = await runBoundedRepair({ root, reference, host: exclusive,
      measure: async () => { if (++calls === 1) return measurement(root,false); if (!evidenceFailure) throw new Error('browser unavailable'); return measurement(root,true); },
      preserve: async record => { if (evidenceFailure && record.label === 'candidate-1') throw new Error('cannot preserve'); } });
    assert.match(result.reason, evidenceFailure ? /evidence-preservation-error/ : /measurement-error/);
    assert.equal(result.selected, 'reference'); assert.deepEqual(read(root), bad);
  }
});

test('protected source changes during measurement cannot be accepted', async t => {
  const { root, reference } = fixture(t); failing(root); let calls = 0;
  const result = await runBoundedRepair({ root, reference, host: exclusive, measure: async () => {
    if (++calls === 1) return measurement(root,false);
    fs.appendFileSync(path.join(root, 'specimen/app.js'), '// unexpected data owner change'); return measurement(root,true);
  } });
  assert.equal(result.status, 'stopped'); assert.equal(result.selected, 'reference'); assert.match(result.reason, /rollback-conflict/);
  assert.match(fs.readFileSync(path.join(root, 'specimen/app.js'), 'utf8'), /unexpected/);
});

test('untrusted reference, excessive budgets and absent isolation fail before measurement', async t => {
  const { root, reference, contract } = fixture(t); let calls = 0; const measure = async () => { calls++; return measurement(root,true); };
  await assert.rejects(runBoundedRepair({ root, reference, measure }), /exclusive workspace/);
  await assert.rejects(runBoundedRepair({ root, reference: { ...reference, conditions: ['mobile'] }, host: exclusive, measure }), /passing reference/);
  await assert.rejects(runBoundedRepair({ root, reference, host: exclusive, measure, budget: { ...contract.budget, maxIterations: 3 } }), /bounds/);
  assert.equal(calls, 0);
});


test('runner refuses source-tree output and preserves existing evidence without writes', t => {
  const { root } = fixture(t);
  const runner = path.resolve(here, '../../examples/responsive-dashboard/qa/run_bounded_repair.mjs');
  const forbidden = path.join(root, 'specimen/new-evidence');
  const rejected = spawnSync(process.execPath, [runner], { env: { ...process.env, DASHBOARD_SPECIMEN_ROOT: root, DASHBOARD_REPAIR_OUTPUT: forbidden }, encoding: 'utf8' });
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /cannot replace source inputs/);
  assert.equal(fs.existsSync(forbidden), false);
  const existing = path.join(root, 'evidence/prior'); fs.mkdirSync(existing, { recursive: true });
  fs.writeFileSync(path.join(existing, 'repair-results.json'), '{"preserved":"original failed run"}\n');
  const before = snapshot(root);
  const repeated = spawnSync(process.execPath, [runner], { env: { ...process.env, DASHBOARD_SPECIMEN_ROOT: root, DASHBOARD_REPAIR_OUTPUT: existing }, encoding: 'utf8' });
  assert.equal(repeated.status, 1);
  assert.match(repeated.stderr, /must be empty/);
  assert.deepEqual(snapshot(root), before);
});


test('operation cannot expand to another selector/property or hide/shrink content', t => {
  const { root } = fixture(t); failing(root);
  unchanged(root, () => proposeResponsiveRepair(root, { expectedSha256: digest(read(root)), selector: 'body' }), /Unsupported operation options/);
  const contractPath = path.join(root, 'qa/repair-contract.json');
  const original = fs.readFileSync(contractPath, 'utf8');
  for (const change of [{ target: '../outside.css' }, { property: 'font-size', approvedValue: '0' }, { selector: 'main', property: 'display', approvedValue: 'none' }]) {
    fs.writeFileSync(contractPath, JSON.stringify({ ...JSON.parse(original), ...change }));
    unchanged(root, () => propose(root), /Unsupported responsive repair contract/);
  }
});


test('runner rejects an external symlink alias into the canonical source tree', t => {
  const { root } = fixture(t);
  const target = path.join(root, 'specimen/empty-evidence'); fs.mkdirSync(target);
  const alias = path.join(path.dirname(root), `evidence-alias-${path.basename(root)}`); fs.symlinkSync(target, alias, 'dir');
  t.after(() => fs.unlinkSync(alias));
  const runner = path.resolve(here, '../../examples/responsive-dashboard/qa/run_bounded_repair.mjs');
  const before = snapshot(root);
  const result = spawnSync(process.execPath, [runner], { env: { ...process.env, DASHBOARD_SPECIMEN_ROOT: root, DASHBOARD_REPAIR_OUTPUT: alias }, encoding: 'utf8' });
  assert.equal(result.status, 1); assert.match(result.stderr, /Symlinked evidence output/);
  assert.deepEqual(snapshot(root), before); assert.deepEqual(fs.readdirSync(target), []);
});


test('runner binds executable inputs while leaving a non-rendered README protected', t => {
  const { root, contract } = fixture(t);
  fs.writeFileSync(path.join(root, 'specimen/README.md'), 'Fixture documentation, not a rendered input.\n');
  const runner = path.resolve(here, '../../examples/responsive-dashboard/qa/run_bounded_repair.mjs');
  const qaRunner = path.resolve(here, '../../examples/responsive-dashboard/qa/run_browser_qa.py');
  const records = ['app.js', 'index.html', 'styles.css'].map(name => ({ path: `specimen/${name}`, sha256: digest(fs.readFileSync(path.join(root, 'specimen', name))) }));
  records.push({ path: 'qa/run_browser_qa.py', sha256: digest(fs.readFileSync(qaRunner)) });
  const evidence = path.join(root, 'evidence'); fs.mkdirSync(evidence);
  fs.writeFileSync(path.join(evidence, 'qa-results.json'), JSON.stringify({
    passed: true, failures: [], matrixVersion: contract.matrixVersion, matrixConditions: conditions, completedConditions: conditions,
    rendered_cases: 2, captureBudget: 40, elapsedSeconds: 0.01, native_zoom: { passed: true, helper_exit_code: 0, themes: [],
      runner_sha256: digest(fs.readFileSync(path.resolve(here, '../../examples/responsive-dashboard/qa/run_native_zoom.py'))),
      source_digests: Object.fromEntries(records.filter(record => record.path.startsWith('specimen/')).map(record => [record.path, record.sha256])),
    },
    provenance: { sources: records, runtime: { testOnly: 'no-browser-executed' } },
  }));
  const before = snapshot(root).filter(([name]) => name.startsWith('specimen/'));
  const result = spawnSync(process.execPath, [runner], { env: { ...process.env, DASHBOARD_SPECIMEN_ROOT: root, PYTHON: '/bin/false' }, encoding: 'utf8' });
  assert.equal(result.status, 1);
  const processRecord = JSON.parse(fs.readFileSync(path.join(evidence, 'bounded-repair/failing-baseline/process.json'), 'utf8'));
  assert.equal(processRecord.status, 1); assert.equal(processRecord.command[0], '/bin/false');
  assert.deepEqual(snapshot(root).filter(([name]) => name.startsWith('specimen/')), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(evidence, 'bounded-repair/repair-results.json'))).status, 'blocked');
});


test('source conflicts during evidence preservation cannot become an accepted candidate', async t => {
  const { root, reference } = fixture(t); failing(root);
  const result = await runBoundedRepair({ root, reference, host: exclusive,
    measure: async ({ label }) => measurement(root, label !== 'failing-baseline'),
    preserve: async ({ label }) => { if (label === 'candidate-1') fs.appendFileSync(path.join(root, 'specimen/app.js'), '// later edit'); },
  });
  assert.equal(result.status, 'stopped'); assert.equal(result.selected, 'reference');
  assert.equal(result.reason, 'post-evidence-source-conflict');
  assert.match(fs.readFileSync(path.join(root, 'specimen/app.js'), 'utf8'), /later edit/);
});

test('evidence preservation time counts toward the wall-time budget', async t => {
  const { root, reference } = fixture(t); failing(root); const bad = read(root); let clock = 0;
  const result = await runBoundedRepair({ root, reference, host: exclusive, now: () => clock,
    measure: async ({ label }) => measurement(root, label !== 'failing-baseline'),
    preserve: async ({ label }) => { if (label === 'candidate-1') clock = 10001; },
  });
  assert.equal(result.reason, 'wall-time-budget'); assert.equal(result.selected, 'reference');
  assert.deepEqual(read(root), bad);
});
