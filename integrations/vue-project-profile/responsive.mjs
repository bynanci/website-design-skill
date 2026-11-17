/** Restore one reviewed CSS declaration in an exclusive dashboard fixture copy. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import postcss from 'postcss';

const MAX_BYTES = 1_000_000;
const TARGET = 'specimen/styles.css';
const APPROVED = 'minmax(150px,1.05fr) minmax(145px,.9fr)';
const INJECTED = '640px 640px';
const DEFAULT_CONTRACT = 'qa/repair-contract.json';
export const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fail = detail => { throw new Error(detail); };
const exact = (value, keys, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) fail(`Invalid ${label} properties`);
};
function file(root, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) fail('Expected project-relative source');
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep)) fail('Source escapes approved root');
  if (fs.realpathSync(absolute) !== absolute) fail('Symlinked sources are unsupported');
  const stat = fs.statSync(absolute);
  if (!stat.isFile() || stat.size > MAX_BYTES) fail('Expected bounded regular source file');
  return absolute;
}
function contractFrom(root, relative) {
  const bytes = fs.readFileSync(file(root, relative));
  const contract = JSON.parse(bytes.toString('utf8'));
  exact(contract, ['version', 'operation', 'sourceRevision', 'target', 'selector', 'property', 'approvedValue', 'injectedValue', 'approvedSourceSha256', 'matrixVersion', 'nativeZoomRequired', 'requiredConditions', 'budget'], 'contract');
  if (contract.version !== '0.1' || contract.operation !== 'restore-dashboard-mix-columns'
    || contract.target !== TARGET || contract.selector !== '.mix-body' || contract.property !== 'grid-template-columns'
    || contract.approvedValue !== APPROVED || contract.injectedValue !== INJECTED
    || !/^[a-f0-9]{40}$/.test(contract.sourceRevision) || !/^[a-f0-9]{64}$/.test(contract.approvedSourceSha256)) fail('Unsupported responsive repair contract');
  if (!Array.isArray(contract.requiredConditions) || !contract.requiredConditions.length || contract.requiredConditions.length > 200
    || contract.requiredConditions.some(value => typeof value !== 'string' || !value.length || value.length > 160)
    || new Set(contract.requiredConditions).size !== contract.requiredConditions.length) fail('Invalid frozen condition matrix');
  if (contract.matrixVersion !== 'dashboard-0.2-20261117' || typeof contract.nativeZoomRequired !== 'boolean') fail('Unsupported matrix execution contract');
  validateBudget(contract.budget);
  return { contract, sha256: digest(bytes), path: relative };
}
function validateBudget(budget) {
  exact(budget, ['maxIterations', 'maxWallTimeMs', 'maxProcesses', 'maxCaptures'], 'budget');
  if (!Number.isInteger(budget.maxIterations) || budget.maxIterations < 0 || budget.maxIterations > 2
    || !Number.isInteger(budget.maxWallTimeMs) || budget.maxWallTimeMs < 1 || budget.maxWallTimeMs > 1_200_000
    || !Number.isInteger(budget.maxProcesses) || budget.maxProcesses < 1 || budget.maxProcesses > 3
    || !Number.isInteger(budget.maxCaptures) || budget.maxCaptures < 0 || budget.maxCaptures > 300) fail('Budget exceeds supported iteration/time/process/capture bounds');
}
function valueRange(bytes) {
  const source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  const sheet = postcss.parse(source, { from: TARGET });
  const rules = sheet.nodes.filter(node => node.type === 'rule' && node.selector === '.mix-body');
  if (rules.length !== 1) fail('Expected one top-level .mix-body rule');
  const declarations = rules[0].nodes.filter(node => node.type === 'decl' && node.prop === 'grid-template-columns');
  if (declarations.length !== 1) fail('Expected one grid-template-columns declaration');
  const declaration = declarations[0];
  if (declaration.important || declaration.raws.value || declaration.value.includes('/*')) fail('Unsupported declaration form');
  const start = declaration.source.start.offset + declaration.prop.length + declaration.raws.between.length;
  const end = start + declaration.value.length;
  if (source.slice(start, end) !== declaration.value) fail('Parser coordinates do not identify the raw value');
  return { source, start, end, value: declaration.value };
}
function replace(bytes, value) {
  const range = valueRange(bytes);
  return { ...range, bytes: Buffer.from(range.source.slice(0, range.start) + value + range.source.slice(range.end), 'utf8') };
}
export function syntheticFailureBytes(rootInput, { contract: contractPath = DEFAULT_CONTRACT } = {}) {
  const root = fs.realpathSync(rootInput);
  const { contract } = contractFrom(root, contractPath);
  const before = fs.readFileSync(file(root, TARGET));
  if (digest(before) !== contract.approvedSourceSha256) fail('Synthetic regression requires the exact reviewed source');
  const range = valueRange(before);
  if (range.value !== APPROVED) fail('Reviewed declaration is absent');
  return replace(before, INJECTED).bytes;
}
function protectedInputs(root) {
  const result = {};
  const visit = relative => {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = path.posix.join(relative, entry.name);
      if (name === TARGET + '.responsive-repair.lock' || /^specimen\/styles\.css\.[a-f0-9-]{36}\.tmp$/.test(name)) continue;
      if (entry.isSymbolicLink()) fail('Symlinked fixture inputs are unsupported');
      if (entry.isDirectory()) visit(name);
      else if (name !== TARGET) {
        if (Object.keys(result).length >= 200) fail('Protected input count exceeds limit');
        result[name] = digest(fs.readFileSync(file(root, name)));
      }
    }
  };
  visit('specimen');
  return result;
}
function planFor(root, input, beforeOverride) {
  exact(input, ['expectedSha256', 'contract'], 'operation options');
  if (!/^[a-f0-9]{64}$/.test(input.expectedSha256)) fail('Expected current raw SHA-256');
  const record = contractFrom(root, input.contract);
  const before = beforeOverride || fs.readFileSync(file(root, TARGET));
  if (digest(before) !== input.expectedSha256) fail('Stale responsive source digest');
  const range = valueRange(before);
  if (![APPROVED, INJECTED].includes(range.value)) fail('Unsupported source value; no speculative repair');
  const candidate = replace(before, APPROVED).bytes;
  if (digest(candidate) !== record.contract.approvedSourceSha256) fail('Candidate differs from frozen reviewed source');
  const reparsed = valueRange(candidate);
  if (reparsed.value !== APPROVED) fail('Candidate fails CSS reparse');
  return {
    version: '0.1', operation: 'restore-dashboard-mix-columns', options: input,
    target: TARGET, contractSha256: record.sha256, protectedDigests: protectedInputs(root),
    sourceRevision: record.contract.sourceRevision,
    expectedSha256: digest(before), candidateSha256: digest(candidate),
    before: before.toString('base64'), after: candidate.toString('base64'),
    edits: range.value === APPROVED ? [] : [{ start: range.start, end: range.end, before: range.value, after: APPROVED }],
    coordinates: 'UTF-16 code units in original CSS',
    parserVersions: { postcss: postcss().version },
    status: range.value === APPROVED ? 'no-op' : 'proposed',
  };
}
export function proposeResponsiveRepair(rootInput, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).some(key => !['expectedSha256', 'contract'].includes(key))) fail('Unsupported operation options');
  const { expectedSha256, contract = DEFAULT_CONTRACT } = options;
  return planFor(fs.realpathSync(rootInput), { expectedSha256, contract });
}
function validatePlan(root, plan) {
  if (!plan || plan.version !== '0.1' || plan.operation !== 'restore-dashboard-mix-columns') fail('Unsupported responsive plan');
  if (typeof plan.before !== 'string' || plan.before.length > MAX_BYTES * 2) fail('Invalid plan bytes');
  const before = Buffer.from(plan.before, 'base64');
  if (before.length > MAX_BYTES || digest(before) !== plan.expectedSha256) fail('Invalid plan source');
  const rebuilt = planFor(root, plan.options, before);
  for (const key of Object.keys(rebuilt)) if (JSON.stringify(rebuilt[key]) !== JSON.stringify(plan[key])) fail(`Tampered responsive plan: ${key}`);
  return rebuilt;
}
function exchange(rootInput, plan, rollback, host) {
  if (host?.exclusiveWorkspace !== true) fail('Responsive writes require an isolated exclusive workspace');
  const root = fs.realpathSync(rootInput);
  const verified = validatePlan(root, plan);
  const target = file(root, TARGET);
  const expected = rollback ? verified.candidateSha256 : verified.expectedSha256;
  const replacement = Buffer.from(rollback ? verified.before : verified.after, 'base64');
  const check = () => {
    if (digest(fs.readFileSync(file(root, TARGET))) !== expected) fail('Responsive concurrent-edit conflict');
    if (digest(fs.readFileSync(file(root, verified.options.contract))) !== verified.contractSha256) fail('Responsive contract conflict');
    if (JSON.stringify(protectedInputs(root)) !== JSON.stringify(verified.protectedDigests)) fail('Protected input conflict');
  };
  check();
  if (verified.status === 'no-op') return { status: 'no-op', sha256: expected };
  const lock = target + '.responsive-repair.lock';
  const temporary = target + `.${crypto.randomUUID()}.tmp`;
  let descriptor;
  let temporaryDescriptor;
  try {
    descriptor = fs.openSync(lock, 'wx', 0o600);
    check();
    const mode = fs.statSync(target).mode & 0o777;
    temporaryDescriptor = fs.openSync(temporary, 'wx', mode);
    fs.fchmodSync(temporaryDescriptor, mode);
    fs.writeFileSync(temporaryDescriptor, replacement);
    fs.fsyncSync(temporaryDescriptor);
    fs.closeSync(temporaryDescriptor); temporaryDescriptor = undefined;
    check();
    fs.renameSync(temporary, target);
    return { status: rollback ? 'rolled-back' : 'applied', sha256: digest(replacement) };
  } finally {
    if (temporaryDescriptor !== undefined) fs.closeSync(temporaryDescriptor);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (descriptor !== undefined) { fs.closeSync(descriptor); fs.unlinkSync(lock); }
  }
}
export const applyResponsiveRepair = (root, plan, host) => exchange(root, plan, false, host);
export const rollbackResponsiveRepair = (root, plan, host) => exchange(root, plan, true, host);

/** The measure callback must execute the complete frozen matrix, never a subset. */
export async function runBoundedRepair({ root: rootInput, measure, reference, contract: contractPath = DEFAULT_CONTRACT, budget, host, now = () => performance.now(), preserve = async () => {} }) {
  if (host?.exclusiveWorkspace !== true) fail('Repair execution requires an isolated exclusive workspace');
  const root = fs.realpathSync(rootInput);
  const record = contractFrom(root, contractPath);
  const protectedBefore = protectedInputs(root);
  const limits = budget || record.contract.budget;
  validateBudget(limits);
  for (const key of Object.keys(limits)) if (limits[key] > record.contract.budget[key]) fail('Runtime budget exceeds reviewed contract');
  const conditions = [...record.contract.requiredConditions].sort();
  const complete = result => result && typeof result.passed === 'boolean' && result.matrixVersion === record.contract.matrixVersion
    && typeof result.nativeZoomPassed === 'boolean' && (!record.contract.nativeZoomRequired || !result.passed || result.nativeZoomPassed) && Array.isArray(result.conditions)
    && JSON.stringify([...result.conditions].sort()) === JSON.stringify(conditions)
    && Array.isArray(result.failures) && result.failures.every(item => typeof item === 'string')
    && Number.isInteger(result.captures) && result.captures >= 0
    && (result.passed ? result.failures.length === 0 : result.failures.length > 0);
  if (!complete(reference) || !reference.passed || reference.sourceSha256 !== record.contract.approvedSourceSha256) fail('A complete passing reference with the reviewed source digest is required');
  if (typeof measure !== 'function' || typeof preserve !== 'function') fail('Measurement and evidence callbacks are required');
  const started = now();
  const result = { version: '0.1', status: 'stopped', reason: null, budget: limits, iterations: 0, processes: 0, captures: 0, attempts: [], selected: 'reference', reference };
  const elapsed = () => now() - started;
  const stop = reason => { result.reason = reason; result.elapsedMs = elapsed(); return result; };
  const seen = new Set();
  const measured = async label => {
    if (elapsed() >= limits.maxWallTimeMs) return { stop: 'wall-time-budget' };
    if (result.processes >= limits.maxProcesses) return { stop: 'process-budget' };
    if (result.captures >= limits.maxCaptures) return { stop: 'capture-budget' };
    result.processes++;
    const expectedSource = digest(fs.readFileSync(file(root, TARGET)));
    const value = await measure({ label, timeoutMs: Math.max(1, Math.floor(limits.maxWallTimeMs - elapsed())), maxCaptures: limits.maxCaptures - result.captures });
    if (Number.isInteger(value?.captures) && value.captures >= 0) result.captures += value.captures;
    if (result.captures > limits.maxCaptures) return { stop: 'capture-budget', value };
    if (!complete(value)) return { stop: 'incomplete-or-invalid-matrix', value };
    if (!/^[a-f0-9]{64}$/.test(value.sourceSha256 || '') || value.sourceSha256 !== expectedSource) return { stop: 'evidence-source-mismatch', value };
    if (digest(fs.readFileSync(file(root, TARGET))) !== expectedSource) return { stop: 'source-changed-during-measurement', value };
    if (elapsed() >= limits.maxWallTimeMs) return { stop: 'wall-time-budget', value };
    return { value };
  };
  const baseline = await measured('failing-baseline');
  await preserve({ label: 'failing-baseline', measurement: baseline.value || null });
  result.attempts.push({ label: 'failing-baseline', measurement: baseline.value || null });
  if (baseline.stop) return stop(baseline.stop);
  if (JSON.stringify(protectedInputs(root)) !== JSON.stringify(protectedBefore)) return stop('protected-input-regression');
  if (baseline.value.passed) { result.status = 'no-change'; result.selected = 'failing-baseline'; return stop('already-passing'); }
  const original = fs.readFileSync(file(root, TARGET));
  while (result.iterations < limits.maxIterations) {
    if (result.processes >= limits.maxProcesses) return stop('process-budget');
    if (result.captures >= limits.maxCaptures) return stop('capture-budget');
    if (elapsed() >= limits.maxWallTimeMs) return stop('wall-time-budget');
    const hash = digest(fs.readFileSync(file(root, TARGET)));
    if (seen.has(hash)) return stop('oscillation');
    seen.add(hash);
    let plan;
    try { plan = proposeResponsiveRepair(root, { expectedSha256: hash, contract: contractPath }); }
    catch (error) { return stop(`unsupported-source: ${error.message}`); }
    if (!plan.edits.length) return stop('no-supported-correction');
    result.iterations++;
    const label = `candidate-${result.iterations}`;
    try { applyResponsiveRepair(root, plan, { exclusiveWorkspace: true }); }
    catch (error) { return stop(`apply-refused: ${error.message}`); }
    let candidate;
    try { candidate = await measured(label); }
    catch (error) {
      rollbackResponsiveRepair(root, plan, { exclusiveWorkspace: true });
      await preserve({ label, plan, measurement: null, rejected: true, reason: 'measurement-error' });
      result.attempts.push({ label, plan, measurement: null, rejected: true });
      return stop(`measurement-error: ${error.message}`);
    }
    const sameInputs = JSON.stringify(protectedInputs(root)) === JSON.stringify(protectedBefore);
    const sameCandidate = digest(fs.readFileSync(file(root, TARGET))) === plan.candidateSha256;
    const accepted = !candidate.stop && candidate.value.passed && sameInputs && sameCandidate;
    try { await preserve({ label, plan, measurement: candidate.value || null, rejected: !accepted, reason: candidate.stop || (accepted ? null : 'matrix-regression-or-unresolved') }); }
    catch (error) {
      result.attempts.push({ label, plan, measurement: candidate.value || null, rejected: true });
      try { rollbackResponsiveRepair(root, plan, { exclusiveWorkspace: true }); }
      catch (conflict) { return stop(`rollback-conflict: ${conflict.message}`); }
      return stop(`evidence-preservation-error: ${error.message}`);
    }
    const afterEvidenceMatches = digest(fs.readFileSync(file(root, TARGET))) === plan.candidateSha256
      && JSON.stringify(protectedInputs(root)) === JSON.stringify(plan.protectedDigests)
      && digest(fs.readFileSync(file(root, plan.options.contract))) === plan.contractSha256;
    if (accepted && !afterEvidenceMatches) {
      result.attempts.push({ label, plan, measurement: candidate.value || null, rejected: true });
      return stop('post-evidence-source-conflict');
    }
    if (elapsed() >= limits.maxWallTimeMs) {
      result.attempts.push({ label, plan, measurement: candidate.value || null, rejected: true });
      try { rollbackResponsiveRepair(root, plan, { exclusiveWorkspace: true }); }
      catch (error) { return stop(`rollback-conflict: ${error.message}`); }
      return stop('wall-time-budget');
    }
    result.attempts.push({ label, plan, measurement: candidate.value || null, rejected: !accepted });
    if (accepted) { result.status = 'accepted'; result.selected = label; return stop('full-matrix-passed'); }
    try { rollbackResponsiveRepair(root, plan, { exclusiveWorkspace: true }); }
    catch (error) { return stop(`rollback-conflict: ${error.message}`); }
    if (!fs.readFileSync(file(root, TARGET)).equals(original)) return stop('rollback-byte-mismatch');
    // This operation has only one reviewed candidate. Retrying it would oscillate.
    return stop(candidate.stop || 'matrix-regression-or-unresolved');
  }
  return stop('iteration-budget');
}
