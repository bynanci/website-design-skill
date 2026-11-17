import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { useTracksStore } from "@/stores/tracks";
import { persistence } from "@/services/track-persistence";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
const tracks = useTracksStore(pinia);

function snapshot() {
  return {
    order: tracks.order.slice(),
    selectedTrackId: tracks.selectedTrackId,
    playhead: tracks.playhead,
    persistenceWrites: persistence.writes.length,
    persistedOrders: persistence.writes.map(order => order.slice()),
  };
}

declare global {
  interface Window { __TRACK_FIXTURE__: { snapshot: typeof snapshot } }
}
window.__TRACK_FIXTURE__ = Object.freeze({ snapshot });
app.mount("#app");
