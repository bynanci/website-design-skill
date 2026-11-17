<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import StatusBanner from "../components/StatusBanner.vue";
import RecoveryPanel from "../components/RecoveryPanel.vue";
import { useMediaLibraryStore } from "../stores/media-library.js";

const media = useMediaLibraryStore();
onMounted(() => { media.load(); });
onBeforeUnmount(() => { media.dispose(); });
</script>

<template>
  <main class="media-library" :aria-busy="media.busy" data-testid="media-panel">
    <header>
      <p class="eyebrow">Synthetic interaction fixture</p>
      <h1>Media library</h1>
      <p>Read a fixture list, select an item, and exercise recovery without native media operations.</p>
    </header>

    <form class="controls" @submit.prevent="media.error ? media.retry() : media.load()">
      <label for="media-filter">Filter media</label>
      <input id="media-filter" data-testid="media-filter" :value="media.filter" @input="media.setFilter($event.target.value)" />
      <button
        type="button"
        data-testid="media-load"
        :aria-disabled="Boolean(media.error && !media.error.retryable)"
        @click="media.error ? media.retry() : media.load()"
      >{{ media.error?.retryable ? 'Retry load' : media.error ? 'Access required' : 'Refresh media' }}</button>
      <button type="button" data-testid="media-cancel" :aria-disabled="!media.busy" @click="media.busy && media.cancel()">Cancel request</button>
    </form>

    <p role="status" aria-live="polite" data-testid="media-status">{{ media.message }}</p>
    <StatusBanner v-if="media.error" kind="destructive" :message="media.error.message" />
    <StatusBanner v-if="media.partial" kind="warning" message="The service marked this list as partial. Existing items remain usable." />

    <RecoveryPanel />

    <section aria-labelledby="media-items-title">
      <h2 id="media-items-title">Available media</h2>
      <p v-if="media.empty" data-testid="media-empty">Try a different filter, then refresh.</p>
      <ul data-testid="media-items">
        <li v-for="item in media.items" :key="item.id">
          <label>
            <input type="radio" name="media-selection" :value="item.id" :checked="media.selectedId === item.id" @change="media.select(item.id)" />
            <span>{{ item.name }}</span>
            <span class="duration">{{ item.duration }}</span>
          </label>
        </li>
      </ul>
      <p data-testid="media-selection">Selected: {{ media.selectedId || 'none' }}</p>
    </section>
  </main>
</template>
