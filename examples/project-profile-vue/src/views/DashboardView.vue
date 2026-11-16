<script setup lang="ts">
import StatusBanner from "@/components/StatusBanner.vue";
import { useDashboardStore } from "@/stores/dashboard";

const dashboard = useDashboardStore();
</script>

<template>
  <main>
    <StatusBanner
      v-if="dashboard.hasWarning"
      kind="warning"
      message="Review the account status"
    />
  </main>
</template>
