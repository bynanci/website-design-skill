import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { compile as compileRuntimeTemplate } from 'vue';
import ts from 'typescript';
import { proposeReorder, applyReorder as applyRaw, rollbackReorder as rollbackRaw, typeCheckReorder } from './patch.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.resolve(HERE, '../../examples/track-reorder-vue');
const component = 'src/components/TrackReorder.vue';
const owner = 'src/stores/tracks.ts';
const service = 'src/services/track-persistence.ts';
const require = createRequire(import.meta.url);
const applyReorder = (root, plan) => applyRaw(root, plan, { exclusiveWorkspace: true });
const rollbackReorder = (root, plan) => rollbackRaw(root, plan, { exclusiveWorkspace: true });
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function project(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-reorder-'));
  const root = path.join(temporary, 'track-reorder-vue');
  fs.cpSync(fixture, root, { recursive: true, filter: file => !file.includes('node_modules') });
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  return root;
}
const read = (root, relative = component) => fs.readFileSync(path.join(root, relative));
const propose = root => proposeReorder(root, { expectedSha256: digest(read(root)) });
function edit(root, relative, change) { fs.writeFileSync(path.join(root, relative), change(read(root, relative).toString('utf8'))); }
function snapshot(root) {
  return fs.readdirSync(root, { recursive: true }).filter(file => fs.statSync(path.join(root, file)).isFile()).sort().map(file => [file, read(root, file).toString('base64')]);
}
function refusesWithoutMutation(root, operation, expected) {
  const before = snapshot(root);
  assert.throws(operation, expected);
  assert.deepEqual(snapshot(root), before);
}

test('proposal inserts only two click handlers and reparses/compiles without writes', t => {
  const root = project(t);
  const original = read(root);
  const before = snapshot(root);
  const plan = propose(root);
  assert.deepEqual(snapshot(root), before);
  assert.equal(plan.status, 'proposed');
  assert.equal(plan.edits.length, 2);
  assert.ok(plan.edits.every(edit => edit.start === edit.end && edit.start >= plan.allowedRange.start && edit.end <= plan.allowedRange.end));
  let restored = Buffer.from(plan.after, 'base64').toString('utf8');
  let added = 0;
  for (const edit of plan.edits) {
    assert.equal(restored.slice(edit.start + added, edit.start + added + edit.text.length), edit.text);
    added += edit.text.length;
  }
  for (const edit of [...plan.edits].reverse()) {
    const preceding = plan.edits.filter(item => item.start < edit.start).reduce((sum, item) => sum + item.text.length, 0);
    restored = restored.slice(0, edit.start + preceding) + restored.slice(edit.start + preceding + edit.text.length);
  }
  assert.deepEqual(Buffer.from(restored), original);
  const descriptor = parse(Buffer.from(plan.after, 'base64').toString('utf8')).descriptor;
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'test' }));
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: component, id: 'test' }).errors, []);
});

test('candidate passes real TypeScript checks against existing owner and service', t => {
  const root = project(t);
  assert.equal(typeCheckReorder(root, propose(root)).status, 'passed');
});

test('typecheck uses the same observed aliases and baseUrl as source inspection', t => {
  const root = project(t);
  edit(root, 'tsconfig.json', source => source.replace('"baseUrl": "."', '"baseUrl": "src"').replace('"@/*": ["src/*"]', '"#src/*": ["*"]'));
  edit(root, component, source => source.replaceAll('@/stores/', '#src/stores/'));
  edit(root, owner, source => source.replaceAll('@/services/', '#src/services/'));
  assert.equal(typeCheckReorder(root, propose(root)).status, 'passed');
});

test('TypeScript rejects an invalid existing owner instead of calling transpilation a typecheck', t => {
  const root = project(t);
  edit(root, owner, source => source.replace('this.order = next;', 'this.order = 42;'));
  const plan = propose(root);
  assert.throws(() => typeCheckReorder(root, plan), /Type check failed/);
  refusesWithoutMutation(root, () => applyReorder(root, plan), /Type check failed/);
});

test('apply and exact rollback preserve protected files and original file mode', t => {
  const root = project(t);
  const before = snapshot(root);
  const mode = fs.statSync(path.join(root, component)).mode;
  const plan = propose(root);
  const result = applyReorder(root, JSON.parse(JSON.stringify(plan)));
  assert.equal(result.status, 'applied');
  assert.equal(digest(read(root)), plan.candidateSha256);
  assert.equal(fs.statSync(path.join(root, component)).mode, mode);
  assert.equal(read(root, owner).toString('base64'), before.find(([file]) => file === owner)[1]);
  assert.equal(read(root, service).toString('base64'), before.find(([file]) => file === service)[1]);
  assert.equal(rollbackReorder(root, plan).status, 'rolled-back');
  assert.deepEqual(snapshot(root), before);
});

test('apply and rollback require the host to declare an exclusive workspace', t => {
  const root = project(t);
  const plan = propose(root);
  refusesWithoutMutation(root, () => applyRaw(root, plan), /isolated, exclusive workspace/);
  refusesWithoutMutation(root, () => rollbackRaw(root, plan), /isolated, exclusive workspace/);
});

test('reapplication using the current digest is an exact no-op', t => {
  const root = project(t);
  applyReorder(root, propose(root));
  const before = snapshot(root);
  const currentPlan = propose(root);
  assert.equal(currentPlan.status, 'no-op');
  assert.deepEqual(currentPlan.edits, []);
  assert.equal(applyReorder(root, currentPlan).status, 'no-op');
  assert.deepEqual(snapshot(root), before);
});

test('stale expected digest is refused before proposal mutation', t => {
  const root = project(t);
  const originalDigest = digest(read(root));
  edit(root, component, source => source + '\n<!-- concurrent -->');
  refusesWithoutMutation(root, () => proposeReorder(root, { expectedSha256: originalDigest }), /Stale/);
});

test('concurrent component changes refuse apply and rollback without overwriting', t => {
  const root = project(t);
  const plan = propose(root);
  edit(root, component, source => source + '\n<!-- changed before apply -->');
  refusesWithoutMutation(root, () => applyReorder(root, plan), /Concurrent edit/);
  fs.writeFileSync(path.join(root, component), Buffer.from(plan.before, 'base64'));
  applyReorder(root, plan);
  edit(root, component, source => source + '\n<!-- changed before rollback -->');
  refusesWithoutMutation(root, () => rollbackReorder(root, plan), /Rollback conflict/);
});

test('changed owner/service context refuses application without mutation', t => {
  const root = project(t);
  const plan = propose(root);
  edit(root, service, source => source + '\n// concurrent context edit\n');
  refusesWithoutMutation(root, () => applyReorder(root, plan), /sourceDigests|Concurrent context edit/);
});

test('existing cooperating lock is respected and preserved', t => {
  const root = project(t);
  const plan = propose(root);
  fs.writeFileSync(path.join(root, component + '.reorder-patch.lock'), 'other operation');
  refusesWithoutMutation(root, () => applyReorder(root, plan), /EEXIST/);
});

test('tampered plans cannot write arbitrary candidate content', t => {
  const root = project(t);
  const plan = propose(root);
  plan.after = Buffer.from('<template>tampered</template>').toString('base64');
  refusesWithoutMutation(root, () => applyReorder(root, plan), /verified operation/);
});

test('BOM, CRLF, non-ASCII comments and both style blocks survive exact rollback', t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, component), Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(read(root).toString('utf8').replaceAll('\n', '\r\n'))]));
  const original = read(root);
  const plan = propose(root);
  const beforeDescriptor = parse(original.toString('utf8')).descriptor;
  const afterDescriptor = parse(Buffer.from(plan.after, 'base64').toString('utf8')).descriptor;
  assert.deepEqual(afterDescriptor.styles.map(style => style.content), beforeDescriptor.styles.map(style => style.content));
  assert.deepEqual(afterDescriptor.scriptSetup.content, beforeDescriptor.scriptSetup.content);
  applyReorder(root, plan);
  rollbackReorder(root, plan);
  assert.deepEqual(read(root), original);
});

for (const [label, change, pattern] of [
  ['duplicate targets', source => source.replace('data-reorder="down"', 'data-reorder="up"'), /exactly one/],
  ['missing target', source => source.replace('data-reorder="up"', 'data-other="up"'), /exactly one/],
  ['conflicting click handler', source => source.replace('data-reorder="up"', 'data-reorder="up" @click="doSomethingElse()"'), /Conflicting/],
  ['click modifier composition', source => source.replace('data-reorder="up"', 'data-reorder="up" @click.stop="tracks.moveTrack(trackId, &quot;up&quot;)"'), /Conflicting/],
  ['object event binding', source => source.replace('data-reorder="up"', 'data-reorder="up" v-on="listeners"'), /Unsupported event/],
  ['bound onclick collision', source => source.replace('data-reorder="up"', 'data-reorder="up" :onClick="other"'), /Unsupported event/],
  ['inline onclick collision', source => source.replace('data-reorder="up"', 'data-reorder="up" onclick="existingSideEffect()"'), /native or ancestor event/],
  ['ancestor event composition', source => source.replace('<div class="track-reorder"', '<div @click="existingSideEffect()" class="track-reorder"'), /native or ancestor event/],
  ['ancestor bound event binding', source => source.replace('<div class="track-reorder"', `<div :onClick="() => tracks.moveTrack(trackId, 'down')" class="track-reorder"`), /ancestor event/],
  ['ancestor object binding', source => source.replace('<div class="track-reorder"', `<div v-bind="{ onClick: () => tracks.moveTrack(trackId, 'down') }" class="track-reorder"`), /ancestor event/],
  ['ancestor dynamic binding', source => source.replace('<div class="track-reorder"', `<div v-bind:['onClick']="() => tracks.moveTrack(trackId, 'down')" class="track-reorder"`), /ancestor event/],
  ['v-pre ancestor', source => source.replace('<div class="track-reorder"', '<div v-pre class="track-reorder"'), /v-pre/],
  ['SVG namespace buttons', source => source.replace('<div class="track-reorder"', '<svg class="track-reorder"').replace('</div>', '</svg>'), /native HTML/],
  ['v-for local scope', source => source.replace('<div class="track-reorder"', '<div v-for="trackId in items" class="track-reorder"'), /Scoped template/],
  ['store binding shadow', source => source.replace('const tracks = useTracksStore();', 'const tracks = useTracksStore();\nfunction hidden(tracks: unknown) {}'), /unshadowed existing store/],
  ['owner import shadow', source => source.replace('const tracks = useTracksStore();', 'const tracks = useTracksStore();\nfunction hidden(useTracksStore: unknown) {}'), /Shadowed owner/],
  ['mutable store binding', source => source.replace('const tracks = useTracksStore();', 'let tracks = useTracksStore();'), /Unsupported executable statement/],
  ['direct action replacement', source => source.replace('const tracks = useTracksStore();', 'const tracks = useTracksStore();\ntracks.moveTrack = () => false;'), /Unsupported executable statement/],
  ['computed action replacement', source => source.replace('const tracks = useTracksStore();', 'const tracks = useTracksStore();\ntracks["moveTrack"] = () => false;'), /Unsupported executable statement/],
  ['indirect action mutation', source => source.replace('const tracks = useTracksStore();', 'const tracks = useTracksStore();\nObject.assign(tracks, {moveTrack: () => false});'), /Unsupported executable statement/],
  ['type-only owner import', source => source.replace('import { useTracksStore }', 'import type { useTracksStore }'), /existing owner import/],
  ['malformed Vue source', source => source.replace('</template>', ''), /Malformed Vue/],
  ['external script block', source => source.replace('<script setup lang="ts">', '<script setup lang="ts" src="external.ts">'), /Malformed Vue|Unsupported SFC/],
  ['unsupported preprocessor', source => source.replace('<template>', '<template lang="pug">'), /Unsupported SFC/],
]) {
  test(`refuses ${label} without mutation`, t => {
    const root = project(t);
    edit(root, component, change);
    refusesWithoutMutation(root, () => propose(root), pattern);
  });
}

test('missing aliases and external symlinks refuse without mutation', t => {
  const root = project(t);
  edit(root, 'tsconfig.json', source => source.replace('"@/*": ["src/*"]', '"@wrong/*": ["src/*"]'));
  refusesWithoutMutation(root, () => propose(root), /missing local alias/);
  fs.writeFileSync(path.join(root, 'tsconfig.json'), fs.readFileSync(path.join(fixture, 'tsconfig.json')));
  const originalService = path.join(root, service);
  const outside = path.join(path.dirname(root), 'service.ts');
  fs.renameSync(originalService, outside);
  fs.symlinkSync(outside, originalService);
  refusesWithoutMutation(root, () => propose(root), /Symlinks/);
});

test('mismatched target compiler versions are refused', t => {
  const root = project(t);
  edit(root, 'package.json', source => source.replace('"vue": "3.5.13"', '"vue": "3.4.0"'));
  refusesWithoutMutation(root, () => propose(root), /versions must match/);
});

test('out-of-root source imports are refused without reading the external file', t => {
  const root = project(t);
  const outside = path.join(path.dirname(root), 'outside.ts');
  fs.writeFileSync(outside, 'export const outside = 1;');
  edit(root, component, source => source.replace('import { useTracksStore }', `import { outside } from ${JSON.stringify(outside)};\nimport { useTracksStore }`));
  const originalRead = fs.readFileSync;
  let reads = 0;
  fs.readFileSync = function (file, ...args) { if (file === outside) reads++; return originalRead.call(this, file, ...args); };
  try { assert.throws(() => propose(root), /Absolute source imports/); }
  finally { fs.readFileSync = originalRead; }
  assert.equal(reads, 0);
});

test('TypeScript host refuses out-of-root reference files before application', t => {
  const root = project(t);
  const outside = path.join(path.dirname(root), 'outside.ts');
  fs.writeFileSync(outside, 'declare const outside: number;');
  edit(root, service, source => `/// <reference path=${JSON.stringify(outside)} />\n${source}`);
  const plan = propose(root);
  const before = snapshot(root);
  const originalRead = fs.readFileSync;
  let reads = 0;
  fs.readFileSync = function (file, ...args) { if (file === outside) reads++; return originalRead.call(this, file, ...args); };
  try { assert.throws(() => applyReorder(root, plan), /Type check failed/); }
  finally { fs.readFileSync = originalRead; }
  assert.equal(reads, 0);
  assert.deepEqual(snapshot(root), before);
});

test('compiled Vue handlers use exactly the existing action arguments and preserve store invariants', t => {
  const root = project(t);
  const plan = propose(root);
  const evaluateModule = (source, resolve) => {
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', compiled)(resolve, module, module.exports);
    return module.exports;
  };
  const serviceModule = evaluateModule(read(root, service).toString('utf8'), require);
  const storeModule = evaluateModule(read(root, owner).toString('utf8'), module => module === '@/services/track-persistence' ? serviceModule : require(module));
  const pinia = require('pinia');
  pinia.setActivePinia(pinia.createPinia());
  const tracks = storeModule.useTracksStore();
  const selected = tracks.selectedTrackId;
  const playhead = tracks.playhead;
  const calls = [];
  const ownerAction = tracks.moveTrack;
  tracks.moveTrack = (...args) => { calls.push(args); return ownerAction(...args); };
  const descriptor = parse(Buffer.from(plan.after, 'base64').toString('utf8')).descriptor;
  const render = compileRuntimeTemplate(descriptor.template.content);
  const vnode = render({ tracks, trackId: 'track-b' }, []);
  const button = direction => vnode.children.find(child => child.props?.['data-reorder'] === direction);
  button('up').props.onClick();
  assert.deepEqual(calls, [['track-b', 'up']]);
  assert.deepEqual([...tracks.order], ['track-b', 'track-a', 'track-c']);
  assert.deepEqual(serviceModule.persistence.writes, [['track-b', 'track-a', 'track-c']]);
  button('up').props.onClick();
  assert.equal(serviceModule.persistence.writes.length, 1, 'boundary no-op performs no duplicate persistence write');
  button('down').props.onClick();
  assert.deepEqual(calls, [['track-b', 'up'], ['track-b', 'up'], ['track-b', 'down']]);
  assert.deepEqual([...tracks.order], ['track-a', 'track-b', 'track-c']);
  assert.equal(serviceModule.persistence.writes.length, 2);
  assert.equal(tracks.selectedTrackId, selected);
  assert.equal(tracks.playhead, playhead);
});
