<script setup>
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { useMediaLibraryStore } from "../stores/media-library.js";
import { createRecoveryHost } from "../runtime/host.js";
import RecoveryNode from "./RecoveryNode.vue";

const media = useMediaLibraryStore();
const dialog = ref(null);
const view = shallowRef({ mode: "static", reason: null, nodes: [] });
let revision = 0;
let disposed = false;
let opener = null;
const testing = globalThis.__MEDIA_TEST_CONTROL__ === true;
const host = createRecoveryHost({
  snapshot: () => ({ revision, status: media.status, error: media.error, items: media.items, disposed }),
  retry: () => media.retry(),
  generate: testing && typeof globalThis.__RECOVERY_GENERATOR__ === "function" ? globalThis.__RECOVERY_GENERATOR__ : undefined,
  timeoutMs: testing && Number.isInteger(globalThis.__RECOVERY_TIMEOUT_MS__) ? globalThis.__RECOVERY_TIMEOUT_MS__ : 1500,
  onChange: value => { view.value = value; },
});
view.value = host.view();
const unsubscribe = media.$subscribe(() => { revision++; host.invalidate("state-changed"); }, { flush: "sync", detached: true });

function restoreFocus() {
  const target = media.error && opener?.isConnected && !opener.disabled ? opener : document.querySelector('[data-testid="media-load"]');
  target?.focus();
}
function closePanel() {
  host.dismiss();
  if (dialog.value?.open) dialog.value.close();
  restoreFocus();
}
async function openPanel() {
  opener = document.activeElement;
  if (!dialog.value.open) dialog.value.showModal();
  await nextTick();
  if (disposed || !dialog.value?.open) return host.view();
  dialog.value.querySelector('[data-testid="recovery-close"]').focus();
  return host.request();
}
function activate(token) {
  const result = host.activate(token, {});
  if (result.status === "activated") closePanel();
  return result;
}
watch(() => media.error, error => { if (!error && dialog.value?.open) closePanel(); });
onBeforeUnmount(() => { disposed = true; unsubscribe(); host.dispose(); });
if (testing) {
  globalThis.__RECOVERY_FIXTURE__ = Object.freeze({
    open: openPanel,
    dismiss: closePanel,
    view: () => host.view(),
    metrics: () => host.metrics(),
    activate,
    request: () => host.request(),
    invalidate: () => host.invalidate("fixture-state-changed"),
  });
}
</script>

<template>
  <div class="recovery-entry">
    <button type="button" data-testid="recovery-open" :disabled="!media.error" @click="openPanel">Recovery guidance</button>
    <dialog ref="dialog" class="recovery-dialog" aria-labelledby="recovery-heading" @cancel.prevent="closePanel">
      <div class="recovery-dialog-header">
        <h2 id="recovery-heading">Recovery guidance</h2>
        <button type="button" data-testid="recovery-close" @click="closePanel">Close</button>
      </div>
      <p role="status" data-testid="recovery-mode">{{ view.mode === 'pending' ? 'Preparing guidance…' : view.mode === 'generated' ? 'Generated suggestion. Recovery actions remain host controlled.' : 'Static recovery is available.' }}</p>
      <p v-if="view.reason" data-testid="recovery-reason">{{ view.reason }}</p>
      <RecoveryNode v-for="(node, index) in view.nodes" :key="index" :node="node" @activate="activate" />
    </dialog>
  </div>
</template>
