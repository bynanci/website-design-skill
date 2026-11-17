import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspectProject } from './inspect.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.resolve(here, '../../examples/project-profile-vue');

function project(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-profile-'));
  const root = path.join(temporary, 'project-profile-vue');
  fs.cpSync(fixture, root, { recursive: true, filter: source => !source.includes('node_modules') });
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  return root;
}

function edit(root, relative, transform) {
  const file = path.join(root, relative);
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}

function changeContract(root, transform) {
  edit(root, 'profile-contract.json', text => JSON.stringify(transform(JSON.parse(text)), null, 2));
}

function snapshot(root) {
  return fs.readdirSync(root, { recursive: true }).filter(relative => fs.statSync(path.join(root, relative)).isFile())
    .map(relative => [relative, fs.readFileSync(path.join(root, relative), 'base64')]);
}

test('maps distinct declared roles, exact props and source owner without writes', t => {
  const root = project(t);
  const before = snapshot(root);
  const result = inspectProject(root);
  assert.deepEqual(snapshot(root), before);
  assert.deepEqual(result.evidence.findings, []);
  assert.deepEqual(result.evidence.drift, []);
  assert.deepEqual(result.evidence.roles.map(item => [item.role, item.reference, item.status]), [
    ['warning', '--color-warning', 'theme-dependent'],
    ['destructive-action', '--color-destructive', 'theme-dependent'],
  ]);
  assert.deepEqual(result.evidence.componentApis[0].props, [
    { name: 'kind', type: '"warning" | "destructive"', required: true },
    { name: 'message', type: 'string', required: true },
  ]);
  assert.equal(result.evidence.stateOwners[0].status, 'source-confirmed');
  assert.equal(result.profile.stateOwners.find(item => item.path === 'src/stores/dashboard.ts').name, 'useDashboardStore');
  assert.ok(result.profile.sources.some(item => item.path === 'src/main.ts' && /^[a-f0-9]{64}$/.test(item.sha256)));
});

test('refuses assigning warning and destructive semantics to the same token', t => {
  const root = project(t);
  changeContract(root, contract => { contract.roles[1].reference = '--color-warning'; return contract; });
  const result = inspectProject(root);
  assert.ok(result.evidence.roles.every(item => item.status === 'conflicting'));
  assert.ok(result.evidence.findings.some(item => item.code === 'conflicting-role'));
});

test('reports a missing theme declaration without inventing a fallback', t => {
  const root = project(t);
  edit(root, 'src/styles/themes.css', text => text.replace(/\s*--color-warning:[^;]+;/, ''));
  const result = inspectProject(root);
  const role = result.evidence.roles.find(item => item.role === 'warning');
  assert.equal(role.status, 'missing');
  assert.deepEqual(role.themes.find(item => item.name === 'dark').declarations, []);
  assert.ok(result.evidence.findings.some(item => item.code === 'missing-theme'));
});

test('reports token files outside the entry import chain', t => {
  const root = project(t);
  edit(root, 'src/main.ts', text => text.replace('import "@/styles/themes.css";\n', ''));
  const result = inspectProject(root);
  assert.ok(result.evidence.findings.some(item => item.code === 'missing-import' && item.detail.includes('themes.css')));
  assert.ok(result.evidence.roles.every(item => item.status === 'missing'));
});

test('inline type-only imports do not load theme styles into the runtime graph', t => {
  const root = project(t);
  edit(root, 'src/main.ts', text => text.replace('import "@/styles/themes.css";', 'import { type Unused } from "@/styles/themes.css";'));
  const result = inspectProject(root);
  assert.ok(!result.evidence.reachablePaths.includes('src/styles/themes.css'));
  assert.ok(result.evidence.roles.every(item => item.status === 'missing'));
  assert.ok(result.evidence.findings.some(item => item.code === 'missing-import'));
});

test('reports scoped unapproved literals and their file line', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('color: var(--foreground);', 'color: #ff0000;'));
  const result = inspectProject(root);
  const drift = result.evidence.drift.find(item => item.value === '#ff0000');
  assert.equal(drift.path, 'src/components/StatusBanner.vue');
  const fileLines = fs.readFileSync(path.join(root, drift.path), 'utf8').split('\n');
  assert.ok(fileLines[drift.line - 1].includes('#ff0000'));
});

test('reports named CSS colors without allowing grammar words as colors', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('color: var(--foreground);', 'color: red;'));
  const result = inspectProject(root);
  assert.ok(result.evidence.drift.some(item => item.property === 'color' && item.value === 'red'));
  assert.ok(!result.evidence.drift.some(item => item.value === 'solid'));
});

test('literal exceptions apply only to the declared file and property', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('color: var(--foreground);', 'color: var(--foreground);\n  margin-inline-start: 4px;'));
  fs.writeFileSync(path.join(root, 'src/styles/unapproved.css'), '.extra { border-inline-start: 4px solid currentColor; }');
  edit(root, 'src/main.ts', text => text + '\nimport "@/styles/unapproved.css";\n');
  const drift = inspectProject(root).evidence.drift;
  assert.ok(drift.some(item => item.path === 'src/components/StatusBanner.vue' && item.property === 'margin-inline-start' && item.value === '4px'));
  assert.ok(drift.some(item => item.path === 'src/styles/unapproved.css' && item.property === 'border-inline-start' && item.value === '4px'));
  assert.ok(!drift.some(item => item.path === 'src/components/StatusBanner.vue' && item.property === 'border-inline-start'));
});

test('fallback consumers remain unknown until computed verification', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('var(--color-warning)', 'var(--color-warning, orange)'));
  const result = inspectProject(root);
  assert.equal(result.evidence.roles.find(item => item.role === 'warning').status, 'unknown');
  assert.ok(result.evidence.unsupported.some(item => item.detail.includes('fallback')));
});

test('conditional theme definitions remain unknown', t => {
  const root = project(t);
  edit(root, 'src/styles/themes.css', text => `@media (prefers-color-scheme: dark) {\n${text}\n}`);
  const result = inspectProject(root);
  assert.ok(result.evidence.roles.every(item => item.status === 'unknown'));
  assert.ok(result.evidence.findings.some(item => item.code === 'unresolved-token-condition'));
});

test('changes the source digest after a token edit and preserves unrelated digests', t => {
  const root = project(t);
  const before = inspectProject(root).profile;
  edit(root, 'src/styles/tokens.scss', text => text + '\n// changed source\n');
  const after = inspectProject(root).profile;
  const digest = (profile, source) => profile.sources.find(item => item.path === source).sha256;
  assert.notEqual(digest(before, 'src/styles/tokens.scss'), digest(after, 'src/styles/tokens.scss'));
  assert.equal(digest(before, 'src/components/StatusBanner.vue'), digest(after, 'src/components/StatusBanner.vue'));
});

test('source digests identify raw bytes including a UTF-8 BOM', t => {
  const root = project(t);
  const file = path.join(root, 'src/main.ts');
  const raw = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), fs.readFileSync(file)]);
  fs.writeFileSync(file, raw);
  const source = inspectProject(root).profile.sources.find(item => item.path === 'src/main.ts');
  assert.equal(source.sha256, crypto.createHash('sha256').update(raw).digest('hex'));
});

test('does not confirm an owner when a local binding shadows its service', t => {
  const root = project(t);
  edit(root, 'src/stores/dashboard.ts', text => text.replace('async refresh()', 'async refresh(getDashboardStatus: () => Promise<{ hasWarning: boolean }>)'));
  const result = inspectProject(root);
  assert.equal(result.evidence.stateOwners[0].status, 'unknown');
});

test('does not confirm a type-only defineStore as a runtime owner', t => {
  const root = project(t);
  edit(root, 'src/stores/dashboard.ts', text => text.replace('import { defineStore }', 'import type { defineStore }'));
  assert.equal(inspectProject(root).evidence.stateOwners[0].status, 'unknown');
});

test('does not confirm a missing service export through a local import alias', t => {
  const root = project(t);
  edit(root, 'src/stores/dashboard.ts', text => text.replace('import { getDashboardStatus }', 'import { missingExport as getDashboardStatus }'));
  assert.equal(inspectProject(root).evidence.stateOwners[0].status, 'unknown');
});

test('does not confirm a type-only named service import', t => {
  const root = project(t);
  edit(root, 'src/stores/dashboard.ts', text => text.replace('import { getDashboardStatus }', 'import { type getDashboardStatus }'));
  assert.equal(inspectProject(root).evidence.stateOwners[0].status, 'unknown');
});

test('does not confirm public props when defineProps is locally shadowed', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('type BannerKind', 'const defineProps = <T>() => ({} as T);\ntype BannerKind'));
  const result = inspectProject(root);
  assert.equal(result.evidence.componentApis[0].status, 'unknown');
});

test('does not report nested defineProps as a public component API', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('defineProps<{', 'function neverCalled() {\ndefineProps<{').replace('}>();', '}>();\n}'));
  const result = inspectProject(root);
  assert.equal(result.evidence.componentApis[0].status, 'unknown');
  assert.deepEqual(result.evidence.componentApis[0].props, []);
});

test('refuses malformed Vue input without changing sources', t => {
  const root = project(t);
  edit(root, 'src/components/StatusBanner.vue', text => text.replace('</template>', ''));
  const before = snapshot(root);
  assert.throws(() => inspectProject(root), /Malformed Vue/);
  assert.deepEqual(snapshot(root), before);
});

test('refuses source imports that escape the approved root', t => {
  const root = project(t);
  const outside = path.join(path.dirname(root), 'outside.ts');
  fs.writeFileSync(outside, 'throw new Error("must not execute");');
  edit(root, 'src/main.ts', text => text + '\nimport "../../outside.ts";\n');
  assert.throws(() => inspectProject(root), /escapes the project root/);
});

test('refuses symlinked token sources', t => {
  const root = project(t);
  const tokens = path.join(root, 'src/styles/tokens.scss');
  const copy = path.join(root, 'src/styles/actual.scss');
  fs.renameSync(tokens, copy);
  fs.symlinkSync(copy, tokens);
  assert.throws(() => inspectProject(root), /Symlinks are unsupported/);
});

test('does not evaluate dynamic Vite configuration', t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, 'vite.config.ts'), 'throw new Error("must not execute");\n');
  assert.equal(inspectProject(root).evidence.roles.length, 2);
});

for (const macro of ['defineEmits<{ saved: [] }>();', 'defineModel<string>();']) {
  test(`extra compiler API remains unknown: ${macro}`, t => {
    const root = project(t);
    edit(root, 'src/components/StatusBanner.vue', text => text.replace('</script>', `${macro}\n</script>`));
    const result = inspectProject(root);
    assert.equal(result.evidence.componentApis[0].status, 'unknown');
    assert.deepEqual(result.profile.components.find(item => item.path === 'src/components/StatusBanner.vue').publicApi, []);
  });
}
