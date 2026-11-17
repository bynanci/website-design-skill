<script setup>
import { nextTick, ref } from "vue";
import { useMediaLibraryStore } from "../stores/media-library.js";
const media = useMediaLibraryStore();
const dialog = ref(null);
let opener;
function dismiss() { dialog.value?.close(); (media.error && opener?.isConnected ? opener : document.querySelector('[data-testid="media-load"]'))?.focus(); }
async function open() { opener = document.activeElement; dialog.value.showModal(); await nextTick(); if (!dialog.value?.open) return; dialog.value.querySelector('[data-testid="recovery-close"]').focus(); }
function retry() { if (media.status === 'error' && media.error?.retryable) { media.retry(); dismiss(); } }
if (globalThis.__MEDIA_TEST_CONTROL__ === true) globalThis.__RECOVERY_FIXTURE__ = Object.freeze({ open, dismiss, view: () => ({ mode: 'static', nodes: [] }) });
</script>

<template>
  <div class="recovery-entry">
    <button type="button" data-testid="recovery-open" :disabled="!media.error" @click="open">Recovery guidance</button>
    <dialog ref="dialog" class="recovery-dialog" aria-labelledby="recovery-heading" @cancel.prevent="dismiss">
      <div class="recovery-dialog-header"><h2 id="recovery-heading">Recovery guidance</h2><button type="button" data-testid="recovery-close" @click="dismiss">Close</button></div>
      <p role="status">Static recovery is available.</p>
      <p>{{ media.error?.message }}</p>
      <button v-if="media.error?.retryable" type="button" data-testid="recovery-action" @click="retry">Retry media read</button>
    </dialog>
  </div>
</template>
