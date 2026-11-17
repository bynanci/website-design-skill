import { defineStore } from "pinia";
import { listMedia, MediaServiceError } from "../services/media-api.js";

// Request controls stay outside serializable UI state and are isolated per store.
const controls = new WeakMap();
function control(store) {
  if (!controls.has(store)) controls.set(store, { sequence: 0, active: null, disposed: false });
  return controls.get(store);
}

export const useMediaLibraryStore = defineStore("media-library", {
  state: () => ({
    status: "idle",
    items: [],
    partial: false,
    error: null,
    selectedId: null,
    filter: "",
  }),
  getters: {
    busy: state => state.status === "loading" || state.status === "refreshing",
    empty: state => state.status === "success" && state.items.length === 0,
    message: state => {
      if (state.status === "loading") return "Loading media…";
      if (state.status === "refreshing") return "Refreshing media. The current list remains available.";
      if (state.status === "error") return state.items.length ? "Refresh failed. The previous list and selection are still available." : "Media could not be loaded.";
      if (state.status === "success" && state.partial) return "Some media is available. The service reported an incomplete list.";
      if (state.status === "success") return state.items.length ? `${state.items.length} media items loaded.` : "No media matches this filter.";
      return "Ready to load media.";
    },
  },
  actions: {
    load({ replace = false } = {}) {
      const runtime = control(this);
      if (runtime.disposed) return Promise.resolve({ outcome: "disposed" });
      if (runtime.active && !replace) return runtime.active.promise;
      if (runtime.active) runtime.active.controller.abort();
      const sequence = ++runtime.sequence;
      const controller = new AbortController();
      this.status = this.items.length ? "refreshing" : "loading";
      this.error = null;
      const current = () => !runtime.disposed && runtime.sequence === sequence && !controller.signal.aborted;
      const promise = listMedia({ signal: controller.signal, filter: this.filter })
        .then(result => {
          if (!current()) return { outcome: "ignored" };
          this.items = result.items;
          this.partial = result.partial;
          if (!this.items.some(item => item.id === this.selectedId)) this.selectedId = null;
          this.status = "success";
          return { outcome: "success" };
        })
        .catch(error => {
          if (!current()) return { outcome: "ignored" };
          const safe = error instanceof MediaServiceError ? error : new MediaServiceError("unavailable");
          this.error = { code: safe.code, message: safe.message, retryable: safe.retryable };
          this.status = "error";
          return { outcome: "error", code: safe.code };
        })
        .finally(() => {
          if (runtime.sequence === sequence) runtime.active = null;
        });
      runtime.active = { sequence, controller, promise };
      return promise;
    },
    retry() {
      const runtime = control(this);
      if (runtime.active) return runtime.active.promise;
      if (!this.error?.retryable) return Promise.resolve({ outcome: "not-retryable" });
      return this.load();
    },
    cancel() {
      const runtime = control(this);
      if (runtime.disposed) return;
      runtime.sequence++;
      runtime.active?.controller.abort();
      runtime.active = null;
      this.status = this.items.length ? "success" : "idle";
      this.error = null;
    },
    dispose() {
      this.cancel();
      control(this).disposed = true;
    },
    setFilter(value) {
      if (control(this).disposed) return;
      if (value !== this.filter) this.cancel();
      this.filter = value;
    },
    select(id) {
      if (control(this).disposed) return;
      if (id === null || this.items.some(item => item.id === id)) this.selectedId = id;
    },
  },
});
