import { defineStore } from "pinia";
import { saveTrackOrder } from "@/services/track-persistence";

export type Direction = "up" | "down";

export const useTracksStore = defineStore("tracks", {
  state: () => ({
    order: ["track-a", "track-b", "track-c"],
    selectedTrackId: "track-b",
    playhead: 125,
  }),
  actions: {
    moveTrack(trackId: string, direction: Direction): boolean {
      const index = this.order.indexOf(trackId);
      if (index < 0 || (direction !== "up" && direction !== "down")) return false;
      const nextIndex = index + (direction === "up" ? -1 : 1);
      if (nextIndex < 0 || nextIndex >= this.order.length) return false;
      const next = this.order.slice();
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      saveTrackOrder(next);
      this.order = next;
      return true;
    },
  },
});
