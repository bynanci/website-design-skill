<!-- Synthetic track controls. Persistence stays in the existing service. -->
<script setup lang="ts">
import { useTracksStore } from "@/stores/tracks";

defineProps<{ trackId: string }>();
const tracks = useTracksStore();
</script>

<template>
  <div class="track-reorder" :data-track-id="trackId">
    <!-- The adapter may only add click bindings to these two native buttons. -->
    <button type="button" data-reorder="up" aria-label="Move track up">Up</button>
    <button type="button" data-reorder="down" aria-label="Move track down">Down</button>
  </div>
</template>

<style scoped>
.track-reorder { display: flex; gap: 0.5rem; }
</style>

<style>
/* Protected unrelated style, including non-ASCII text: 軌道。 */
button:focus-visible { outline: 2px solid currentColor; }
</style>
