<script setup lang="ts">
type BannerKind = "warning" | "destructive";

defineProps<{
  kind: BannerKind;
  message: string;
}>();
</script>

<template>
  <div class="status-banner" :data-kind="kind" role="status">
    {{ message }}
  </div>
</template>

<style scoped lang="scss">
.status-banner {
  color: var(--foreground);
  background: var(--surface);
  border-inline-start: 4px solid var(--color-warning);
}

.status-banner[data-kind="destructive"] {
  border-color: var(--color-destructive);
}
</style>
