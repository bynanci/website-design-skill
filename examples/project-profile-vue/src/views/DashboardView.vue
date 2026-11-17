<script setup lang="ts">
import { onMounted } from "vue";
import StatusBanner from "@/components/StatusBanner.vue";
import { useDashboardStore } from "@/stores/dashboard";

const dashboard = useDashboardStore();
onMounted(() => dashboard.refresh());
</script>

<template>
  <main>
    <h1>Project profile theme fixture</h1>
    <p>The same component consumes distinct warning and destructive-action tokens.</p>
    <StatusBanner
      v-if="dashboard.hasWarning"
      kind="warning"
      message="Review the account status"
    />
    <StatusBanner
      kind="destructive"
      message="Deletion cannot be undone"
    />
  </main>
</template>
