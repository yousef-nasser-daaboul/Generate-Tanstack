<script setup lang="ts">
interface DropdownProps {
  items: string[];
  label: string;
}

const props = defineProps<DropdownProps>();
const selected = defineModel<string>();
selected.value = props.items[0];
</script>

<template>
  <div>
    <label>{{ props.label }}</label>
    <USelect v-model="selected" :options="props.items" />
  </div>
</template>
