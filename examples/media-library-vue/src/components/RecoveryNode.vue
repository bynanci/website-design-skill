<script setup>
defineProps({ node: { type: Object, required: true } });
const emit = defineEmits(["activate"]);
</script>

<template>
  <section v-if="node.type === 'Group'" class="recovery-group" :aria-label="node.props.label">
    <RecoveryNode v-for="(child, index) in node.children" :key="index" :node="child" @activate="emit('activate', $event)" />
  </section>
  <section v-else-if="node.type === 'Notice'" class="recovery-notice" :data-tone="node.props.tone">
    <h3>{{ node.props.title }}</h3>
    <p>{{ node.props.text }}</p>
  </section>
  <button v-else-if="node.type === 'ActionButton'" type="button" data-testid="recovery-action" @click="emit('activate', node.action.token)">
    {{ node.props.label }}
  </button>
</template>
