/** Execute transitions through the actual Pinia owner and injected read service. */
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import path from 'node:path';
import os from 'node:os';
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createPinia } from 'pinia';
import { inspectProject } from './inspect.mjs';

const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolRoot, '../../examples/media-library-vue');
// Test exact source bytes with the tool's pinned dependencies, without adding
// dependencies or a node_modules link to the inspected fixture.
const sandbox = await mkdtemp(path.join(os.tmpdir(), 'website-media-runtime-'));
after(async () => { await rm(sandbox, { recursive: true, force: true }); });
await mkdir(path.join(sandbox, 'src'), { recursive: true });
await cp(path.join(root, 'src/stores'), path.join(sandbox, 'src/stores'), { recursive: true });
await cp(path.join(root, 'src/services'), path.join(sandbox, 'src/services'), { recursive: true });
await writeFile(path.join(sandbox, 'package.json'), '{"type":"module"}\n');
await symlink(path.join(toolRoot, 'node_modules'), path.join(sandbox, 'node_modules'), 'dir');
const { useMediaLibraryStore } = await import(pathToFileURL(path.join(sandbox, 'src/stores/media-library.js')));
const { configureMediaSource, createDeferredMediaSource } = await import(pathToFileURL(path.join(sandbox, 'src/services/media-api.js')));
const first = { id: 'clip-1', name: 'Harbor arrival', duration: '00:12' };
const second = { id: 'clip-2', name: 'Evening walk', duration: '00:18' };
const response = (items = [first], partial = false) => ({ items, partial });

function fixture(t, options) {
  const deferred = createDeferredMediaSource(options);
  configureMediaSource(deferred.source);
  const store = useMediaLibraryStore(createPinia());
  t.after(() => { store.dispose(); configureMediaSource(); });
  return { store, deferred };
}

test('delayed initial loading resolves to empty and then usable success through the read boundary', async t => {
  const { store, deferred } = fixture(t);
  assert.equal(store.status, 'idle');
  const initial = store.load();
  assert.equal(store.status, 'loading');
  assert.equal(store.busy, true);
  assert.deepEqual(deferred.pending(), [1]);
  assert.equal(store.items.length, 0);
  deferred.resolve(1, response([]));
  assert.deepEqual(await initial, { outcome: 'success' });
  assert.equal(store.empty, true);
  const next = store.load();
  deferred.resolve(2, response([first, second]));
  await next;
  assert.equal(store.status, 'success');
  assert.equal(store.empty, false);
  assert.deepEqual(store.items, [first, second]);
  assert.equal(deferred.requests().length, 2);
});

test('safe retry coalesces repeated clicks into one idempotent read; denied access is not retryable', async t => {
  const { store, deferred } = fixture(t);
  const failing = store.load();
  deferred.reject(1);
  await failing;
  assert.equal(store.status, 'error');
  assert.equal(store.error.retryable, true);
  const retry = store.retry();
  const repeated = store.retry();
  const alsoRefresh = store.load();
  assert.equal(store.status, 'loading');
  assert.equal(deferred.requests().length, 2);
  deferred.resolve(2, response());
  await Promise.all([retry, repeated, alsoRefresh]);
  assert.equal(store.status, 'success');

  const denied = store.load();
  deferred.reject(3, 'permission_denied');
  await denied;
  assert.equal(store.error.retryable, false);
  assert.deepEqual(await store.retry(), { outcome: 'not-retryable' });
  assert.equal(deferred.requests().length, 3);
});

test('a failed background refresh preserves items, selection, filter and partial-data information', async t => {
  const { store, deferred } = fixture(t);
  store.setFilter('Harbor');
  const initial = store.load();
  deferred.resolve(1, response([first, second], true));
  await initial;
  store.select(first.id);
  const preserved = structuredClone({ items: [...store.items].map(item => ({ ...item })), selectedId: store.selectedId, filter: store.filter, partial: store.partial });
  const refresh = store.load();
  assert.equal(store.status, 'refreshing');
  assert.equal(store.selectedId, first.id);
  assert.equal(deferred.requests()[1].filter, 'Harbor');
  deferred.reject(2);
  await refresh;
  assert.equal(store.status, 'error');
  assert.deepEqual({ items: [...store.items].map(item => ({ ...item })), selectedId: store.selectedId, filter: store.filter, partial: store.partial }, preserved);
  assert.match(store.message, /previous list and selection/);
  const recovery = store.retry();
  deferred.resolve(3, response([first]));
  await recovery;
  assert.equal(store.selectedId, first.id);
  assert.equal(store.filter, 'Harbor');
  assert.equal(store.partial, false);
});

test('replacement aborts the old request and ignores a late response from a service that ignores abort', async t => {
  const { store, deferred } = fixture(t, { respectAbort: false });
  const old = store.load();
  const current = store.load({ replace: true });
  assert.equal(deferred.requests()[0].aborted, true);
  deferred.resolve(2, response([second]));
  await current;
  deferred.resolve(1, response([first]));
  assert.deepEqual(await old, { outcome: 'ignored' });
  assert.deepEqual(store.items, [second]);
  assert.equal(store.status, 'success');
});

test('filter edits cancel the previous query and late data cannot replace newer input', async t => {
  const { store, deferred } = fixture(t, { respectAbort: false });
  const old = store.load();
  store.setFilter('Evening');
  assert.equal(store.status, 'idle');
  assert.equal(deferred.requests()[0].aborted, true);
  deferred.resolve(1, response([first]));
  await old;
  assert.equal(store.filter, 'Evening');
  assert.deepEqual(store.items, []);
  const current = store.load();
  assert.equal(deferred.requests()[1].filter, 'Evening');
  deferred.resolve(2, response([second]));
  await current;
  assert.deepEqual(store.items, [second]);
});

test('cancel and disposal prevent late updates and disposal prevents subsequent reads', async t => {
  const { store, deferred } = fixture(t, { respectAbort: false });
  const cancelled = store.load();
  store.cancel();
  deferred.resolve(1, response([first]));
  await cancelled;
  assert.equal(store.status, 'idle');
  assert.deepEqual(store.items, []);
  const unfinished = store.load();
  store.dispose();
  const disposed = JSON.stringify(store.$state);
  assert.equal(deferred.requests()[1].aborted, true);
  deferred.resolve(2, response([second]));
  await unfinished;
  assert.equal(JSON.stringify(store.$state), disposed);
  assert.deepEqual(await store.load(), { outcome: 'disposed' });
  store.setFilter('ignored');
  store.select(second.id);
  store.cancel();
  assert.equal(JSON.stringify(store.$state), disposed);
  assert.equal(deferred.requests().length, 2);
});

test('an abort-aware service releases pending requests without presenting cancellation as failure', async t => {
  const { store, deferred } = fixture(t);
  const loading = store.load();
  store.cancel();
  await loading;
  assert.deepEqual(deferred.pending(), []);
  assert.equal(deferred.requests()[0].aborted, true);
  assert.equal(store.error, null);
  assert.equal(store.status, 'idle');
});

test('invalid responses fail safely and arbitrary service errors do not enter UI text', async t => {
  const { store, deferred } = fixture(t);
  const initial = store.load();
  deferred.resolve(1, { items: [first, first], partial: false });
  await initial;
  assert.equal(store.error.code, 'invalid_response');
  assert.equal(store.error.retryable, false);
  configureMediaSource(() => { throw new Error('private host error'); });
  await store.load();
  assert.equal(store.error.code, 'unavailable');
  assert.doesNotMatch(store.error.message, /private/);
});

test('the bounded source adapter confirms one observed media owner, service and status API', () => {
  const result = inspectProject(root, { entry: 'src/main.js', contract: 'profile-contract.json' });
  assert.deepEqual(result.evidence.findings, []);
  assert.deepEqual(result.evidence.drift, []);
  assert.deepEqual(result.evidence.unsupported, []);
  assert.equal(result.evidence.stateOwners.length, 1);
  assert.equal(result.evidence.stateOwners[0].status, 'source-confirmed');
  assert.equal(result.evidence.stateOwners[0].serviceCallsInAction, 1);
  assert.equal(result.evidence.componentApis[0].status, 'source-confirmed');
});

test('session permission denial survives filter edits, cancel and direct read attempts', async t => {
  const { store, deferred } = fixture(t);
  const initial = store.load();
  deferred.reject(1, 'permission_denied');
  await initial;
  store.setFilter('Evening');
  store.cancel();
  assert.equal(store.status, 'error');
  assert.equal(store.error.code, 'permission_denied');
  assert.equal(store.filter, 'Evening');
  assert.deepEqual(await store.retry(), { outcome: 'not-retryable' });
  assert.deepEqual(await store.load(), { outcome: 'not-retryable' });
  assert.equal(deferred.requests().length, 1);
});
