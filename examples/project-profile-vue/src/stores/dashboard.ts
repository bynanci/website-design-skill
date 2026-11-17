import { defineStore } from "pinia";
import { getDashboardStatus } from "@/services/dashboard-api";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({ hasWarning: false }),
  actions: {
    async refresh() {
      const result = await getDashboardStatus();
      this.hasWarning = result.hasWarning;
    },
  },
});
