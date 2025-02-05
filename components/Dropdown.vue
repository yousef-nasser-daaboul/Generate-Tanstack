<script setup lang="ts">
export interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  items: DropdownItem[];
  label: string;
}

const props = defineProps<DropdownProps>();

const selected = ref();
</script>

<template>
  {{ selected }}dddd
  <UDropdown
    @change="
      (e) => {
        console.log(e);
      }
    "
    :items="[props.items]"
    :popper="{ arrow: true, placement: 'bottom' }"
  >
    <UButton
      color="white"
      class="w-48 flex justify-between"
      :label="props.label"
      trailing-icon="i-heroicons-chevron-down-20-solid"
    />
    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>
    </template>
  </UDropdown>
</template>
