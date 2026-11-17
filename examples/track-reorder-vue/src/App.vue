<script setup lang="ts">
import TrackReorder from "@/components/TrackReorder.vue";
import { useTracksStore } from "@/stores/tracks";
import { persistence } from "@/services/track-persistence";

const tracks = useTracksStore();
</script>

<template>
  <main>
    <h1>Track reorder fixture</h1>
    <p>Move track-b through the existing action and persistence boundary.</p>
    <TrackReorder track-id="track-b" />
    <p>Order: <output data-testid="track-order">{{ tracks.order.join(",") }}</output></p>
    <p>Selected: <output data-testid="selected-track">{{ tracks.selectedTrackId }}</output></p>
    <p>Playhead: <output data-testid="playhead">{{ tracks.playhead }}</output></p>
    <p>Persistence writes: <output data-testid="persistence-count">{{ persistence.writes.length }}</output></p>
  </main>
</template>
