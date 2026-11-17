<script setup lang="ts">
defineProps<{
  kind: "warning" | "destructive";
  message: string;
}>();
</script>

<template>
  <p class="status-banner" :data-kind="kind" :role="kind === 'destructive' ? 'alert' : 'status'">{{ message }}</p>
</template>

<style scoped>
.status-banner { padding: var(--space-3); color: var(--foreground); background: var(--surface); border-inline-start: 4px solid var(--color-warning); }
.status-banner[data-kind="destructive"] { border-color: var(--color-destructive); }
</style>
