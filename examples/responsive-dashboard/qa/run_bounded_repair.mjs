#!/usr/bin/env node
/** Reuse the accepted dashboard QA matrix for one controlled CSS regression. */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { digest, syntheticFailureBytes, runBoundedRepair } from '../../../integrations/vue-project-profile/responsive.mjs';

const canonicalRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let root = path.resolve(process.env.DASHBOARD_SPECIMEN_ROOT || canonicalRoot);
const referencePath = path.resolve(process.env.DASHBOARD_REPAIR_REFERENCE || path.join(root, 'evidence/qa-results.json'));
const output = path.resolve(process.env.DASHBOARD_REPAIR_OUTPUT || path.join(root, 'evidence/bounded-repair'));
const qaRunner = path.join(canonicalRoot, 'qa/run_browser_qa.py');
const contractPath = 'qa/repair-contract.json';
let contract;
let temporary;
let evidenceAllowed = false;
let result;
const measurements = new Map();
async function assertOutputPath(destination, sourceRoot) {
  // Reject aliases before mkdir: following an external symlink can otherwise
  // write a report into the canonical fixture while passing a lexical check.
  let current = path.parse(destination).root;
  for (const part of destination.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink()) throw new Error('Symlinked evidence output paths are unsupported');
      if (!stat.isDirectory()) throw new Error('Evidence output ancestor is not a directory');
    } catch (error) { if (error.code === 'ENOENT') break; throw error; }
  }
  const specimen = path.join(sourceRoot, 'specimen');
  if (destination === specimen || destination.startsWith(specimen + path.sep)) throw new Error('Evidence output cannot replace source inputs');
}
async function containedSource(relative) {
  const absolute = path.join(root, relative);
  if (await fs.realpath(absolute) !== absolute || !(await fs.stat(absolute)).isFile()) throw new Error('Expected regular contained fixture source');
  return absolute;
}
async function filesBelow(directory, relative = '') {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlinked specimen inputs are unsupported');
    if (entry.isDirectory()) result.push(...await filesBelow(path.join(directory, entry.name), name));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort();
}
async function inputDigests(directory) {
  const result = {};
  for (const relative of await filesBelow(path.join(directory, 'specimen'))) {
    // Match the QA runner's observed executable-input domain; fixture README
    // files are protected by the source adapter but are not rendered inputs.
    if (!['.html', '.css', '.js', '.json'].includes(path.extname(relative))) continue;
    const filename = path.posix.join('specimen', relative);
    result[filename] = digest(await fs.readFile(path.join(directory, filename)));
  }
  return result;
}
async function pngCount(directory) {
  return (await filesBelow(directory)).filter(name => name.endsWith('.png')).length;
}
function normalize(report, captures, execution) {
  const failures = [...(report.failures || [])];
  if (report.execution_error) failures.push(`QA execution error: ${report.execution_error.type}: ${report.execution_error.message}`);
  if (execution && execution.status !== 0 && report.passed) failures.push(`QA exited ${execution.status} despite a passing report`);
  return {
    passed: report.passed === true && failures.length === 0 && (!execution || execution.status === 0),
    matrixVersion: report.matrixVersion,
    conditions: report.completedConditions || (report.checks || []).map(record => record.scenario),
    nativeZoomPassed: report.native_zoom?.passed === true && report.native_zoom?.helper_exit_code === 0,
    failures, captures,
    sourceSha256: (report.provenance?.sources || []).find(source => source.path === contract.target)?.sha256,
    report,
  };
}
try {
  root = await fs.realpath(root);
  if (await fs.realpath(path.join(root, 'specimen')) !== path.join(root, 'specimen')) throw new Error('Symlinked specimen root is unsupported');
  await assertOutputPath(output, root);
  contract = JSON.parse(await fs.readFile(await containedSource(contractPath), 'utf8'));
  await fs.mkdir(output, { recursive: true });
  if ((await fs.readdir(output)).length) throw new Error('Evidence directory must be empty; preserve prior runs under their original path');
  evidenceAllowed = true;
  const sourceDigests = await inputDigests(root);
  if (sourceDigests[contract.target] !== contract.approvedSourceSha256) throw new Error('Repair contract does not freeze the current accepted CSS source');
  const referenceRaw = JSON.parse(await fs.readFile(referencePath, 'utf8'));
  const sourceRecords = new Map((referenceRaw.provenance?.sources || []).map(source => [source.path, source.sha256]));
  for (const [filename, sha256] of Object.entries(sourceDigests)) if (sourceRecords.get(filename) !== sha256) throw new Error(`Reference does not identify current source: ${filename}`);
  const runnerSha256 = digest(await fs.readFile(qaRunner));
  if (sourceRecords.get('qa/run_browser_qa.py') !== runnerSha256) throw new Error('Reference runner differs from the canonical QA runner');
  const nativeRunnerSha256 = digest(await fs.readFile(path.join(canonicalRoot, 'qa/run_native_zoom.py')));
  if (contract.nativeZoomRequired) {
    if (referenceRaw.native_zoom?.runner_sha256 !== nativeRunnerSha256) throw new Error('Reference native zoom helper differs from the canonical helper');
    for (const [filename, sha256] of Object.entries(sourceDigests)) if (referenceRaw.native_zoom?.source_digests?.[filename] !== sha256) throw new Error(`Reference native zoom does not identify source: ${filename}`);
  }
  if (JSON.stringify([...referenceRaw.matrixConditions].sort()) !== JSON.stringify([...contract.requiredConditions].sort())) throw new Error('Reference matrix differs from the frozen repair contract');
  const referenceCaptureBudget = referenceRaw.captureBudget;
  if (!Number.isInteger(referenceCaptureBudget) || referenceCaptureBudget < 1 || referenceCaptureBudget > 128) throw new Error('Reference lacks a bounded capture policy');
  const referenceCaptures = referenceRaw.rendered_cases + (referenceRaw.native_zoom?.themes?.length || 0);
  const reference = normalize(referenceRaw, referenceCaptures);
  const referenceElapsedMs = Math.ceil(referenceRaw.elapsedSeconds * 1000);
  if (!Number.isFinite(referenceElapsedMs) || referenceElapsedMs < 0) throw new Error('Reference lacks measured execution time');
  const budget = {
    ...contract.budget,
    maxProcesses: contract.budget.maxProcesses - 1,
    maxCaptures: contract.budget.maxCaptures - referenceCaptures,
    maxWallTimeMs: contract.budget.maxWallTimeMs - referenceElapsedMs,
  };
  if (budget.maxProcesses < 1 || budget.maxCaptures < 1 || budget.maxWallTimeMs < 1) throw new Error('Passing reference exhausted the overall repair budget');
  await fs.writeFile(path.join(output, 'reference.json'), JSON.stringify(referenceRaw, null, 2) + '\n');
  await fs.writeFile(path.join(output, 'frozen-inputs.json'), JSON.stringify({
    version: '0.1', sourceDigests, runnerSha256, contract,
    hostRuntime: { node: process.version, platform: process.platform, architecture: process.arch },
    toolDigests: {
      orchestrator: digest(await fs.readFile(fileURLToPath(import.meta.url))),
      sourceAdapter: digest(await fs.readFile(path.resolve(canonicalRoot, '../../integrations/vue-project-profile/responsive.mjs'))),
      nativeZoomHelper: nativeRunnerSha256,
    },
    clockAnimationPolicy: 'Fixture data frozen; prefers-reduced-motion: reduce; same QA runner, locale and runtime for every pass.',
    hostBoundary: 'A synthetic regression is injected only into an exclusive temporary copy. The canonical accepted fixture and reference captures remain unchanged.',
    visualReview: { status: 'not-run-by-this-runner', method: 'Actual captures are preserved for separate image review; DOM checks do not imply vision approval.' },
  }, null, 2) + '\n');

  temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'dashboard-bounded-repair-'));
  const workspace = path.join(temporary, 'responsive-dashboard');
  await fs.cp(root, workspace, { recursive: true, filter: source => {
    const relative = path.relative(root, source);
    return !relative.split(path.sep).some(part => ['evidence', 'node_modules'].includes(part)) && source !== output && !source.startsWith(output + path.sep);
  } });
  await fs.writeFile(path.join(workspace, contract.target), syntheticFailureBytes(workspace));
  const injectedSourceSha256 = digest(await fs.readFile(path.join(workspace, contract.target)));
  result = await runBoundedRepair({
    root: workspace, contract: contractPath, reference, budget, host: { exclusiveWorkspace: true },
    measure: async ({ label, timeoutMs, maxCaptures }) => {
      const directory = path.join(output, label);
      await fs.mkdir(directory, { recursive: true });
      await fs.copyFile(path.join(workspace, contract.target), path.join(directory, 'styles.css'));
      const execution = spawnSync(process.env.PYTHON || 'python3', [qaRunner], {
        env: { ...process.env, DASHBOARD_SPECIMEN_ROOT: workspace, DASHBOARD_QA_OUTPUT: directory,
          DASHBOARD_MAX_CAPTURES: String(Math.min(referenceCaptureBudget, maxCaptures)),
          DASHBOARD_MAX_SECONDS: String(Math.min(1800, Math.max(1, Math.floor(timeoutMs / 1000)))) },
        timeout: timeoutMs, killSignal: 'SIGTERM', detached: process.platform !== 'win32',
        encoding: 'utf8', maxBuffer: 2_000_000,
      });
      if (execution.error && execution.pid && process.platform !== 'win32') {
        try { process.kill(-execution.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
      }
      await fs.writeFile(path.join(directory, 'process.json'), JSON.stringify({
        command: [process.env.PYTHON || 'python3', 'examples/responsive-dashboard/qa/run_browser_qa.py'],
        status: execution.status, signal: execution.signal,
        error: execution.error ? { name: execution.error.name, message: execution.error.message } : null,
        limits: { timeoutMs, maxCaptures: Math.min(referenceCaptureBudget, maxCaptures), maxOutputBytes: 2_000_000 },
        stdout: execution.stdout || '', stderr: execution.stderr || '',
      }, null, 2) + '\n');
      if (execution.error || execution.signal) throw new Error(`QA process did not complete within its limits: ${execution.error?.message || execution.signal}`);
      const report = JSON.parse(await fs.readFile(path.join(directory, 'qa-results.json'), 'utf8'));
      const normalized = normalize(report, await pngCount(directory), execution);
      const measuredSources = new Map((report.provenance?.sources || []).map(source => [source.path, source.sha256]));
      for (const [filename, sha256] of Object.entries(await inputDigests(workspace))) {
        if (measuredSources.get(filename) !== sha256) { normalized.passed = false; normalized.failures.push(`QA source evidence does not match measured input: ${filename}`); }
      }
      if (contract.nativeZoomRequired) {
        if (report.native_zoom?.runner_sha256 !== nativeRunnerSha256) { normalized.passed = false; normalized.failures.push('Native zoom helper differs from frozen source'); }
        for (const [filename, sha256] of Object.entries(await inputDigests(workspace))) {
          if (report.native_zoom?.source_digests?.[filename] !== sha256) { normalized.passed = false; normalized.failures.push(`Native zoom source evidence does not match input: ${filename}`); }
        }
      }
      if (JSON.stringify(report.provenance?.runtime) !== JSON.stringify(referenceRaw.provenance?.runtime)) {
        normalized.passed = false; normalized.failures.push('QA runtime differs from the frozen passing reference');
      }
      measurements.set(label, normalized);
      return normalized;
    },
    preserve: async record => {
      const directory = path.join(output, record.label);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, 'disposition.json'), JSON.stringify(record, null, 2) + '\n');
      if (record.plan) {
        await fs.writeFile(path.join(directory, 'before.css'), Buffer.from(record.plan.before, 'base64'));
        await fs.writeFile(path.join(directory, 'after.css'), Buffer.from(record.plan.after, 'base64'));
        const comparison = spawnSync('diff', ['-u', '--label', 'specimen/styles.css (before)', '--label', 'specimen/styles.css (candidate)', path.join(directory, 'before.css'), path.join(directory, 'after.css')], { encoding: 'utf8', maxBuffer: 2_000_000 });
        if (comparison.error || ![0, 1].includes(comparison.status)) throw new Error('Cannot preserve exact source diff');
        await fs.writeFile(path.join(directory, 'candidate.diff'), comparison.stdout);
      }
    },
  });
  if (JSON.stringify(await inputDigests(root)) !== JSON.stringify(sourceDigests)) throw new Error('Canonical accepted fixture changed during repair experiment');
  const summary = {
    ...result, injectedSourceSha256, approvedSourceSha256: contract.approvedSourceSha256,
    overallBudget: contract.budget,
    runtime: { node: process.version, platform: process.platform, qa: referenceRaw.provenance.runtime },
    usageIncludingReference: { processes: result.processes + 1, captures: result.captures + referenceCaptures, elapsedMs: result.elapsedMs + referenceElapsedMs },
    selectedKnownPassing: result.status === 'accepted' ? result.selected : 'canonical-reference',
    originalFixturePreserved: true,
    command: 'node examples/responsive-dashboard/qa/run_bounded_repair.mjs',
    unrun: ['General CSS repair', 'Native Tauri shell and physical device input', 'Automatic visual-quality judgment; actual captures require separate review'],
  };
  await fs.writeFile(path.join(output, 'repair-results.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({ status: result.status, reason: result.reason, iterations: result.iterations, usage: summary.usageIncludingReference }));
  if (result.status !== 'accepted') process.exitCode = 1;
} catch (error) {
  if (evidenceAllowed) await fs.writeFile(path.join(output, 'repair-results.json'), JSON.stringify({
    version: '0.1', status: 'blocked', error: { name: error.name, message: error.message },
    attempts: [...measurements].map(([label, measurement]) => ({ label, measurement })),
    selectedKnownPassing: 'canonical-reference',
    note: 'The canonical fixture was never mutated; missing or failed checks are not passes.',
  }, null, 2) + '\n');
  console.error(`Bounded repair refused: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (temporary) await fs.rm(temporary, { recursive: true, force: true });
}
