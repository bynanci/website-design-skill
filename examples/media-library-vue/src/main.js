import { createApp } from "vue";
import { createPinia } from "pinia";
import MediaLibrary from "./views/MediaLibrary.vue";
import { useMediaLibraryStore } from "./stores/media-library.js";
import { configureMediaSource, createDeferredMediaSource } from "./services/media-api.js";
import "./styles/tokens.css";
import "./styles/layout.css";

const pinia = createPinia();
const app = createApp(MediaLibrary).use(pinia);
// This opt-in control exists only in the synthetic fixture entry point.
if (globalThis.__MEDIA_TEST_CONTROL__ === true) {
  const deferred = createDeferredMediaSource({ respectAbort: false });
  configureMediaSource(deferred.source);
  const store = useMediaLibraryStore(pinia);
  globalThis.__MEDIA_FIXTURE__ = Object.freeze({
    pending: deferred.pending,
    requests: deferred.requests,
    resolve: deferred.resolve,
    reject: deferred.reject,
    snapshot: () => JSON.parse(JSON.stringify(store.$state)),
    load: options => { store.load(options); },
    cancel: () => store.cancel(),
    dispose: () => store.dispose(),
    setFilter: value => store.setFilter(value),
    select: id => store.select(id),
    unmount: () => app.unmount(),
  });
}
app.mount("#app");
