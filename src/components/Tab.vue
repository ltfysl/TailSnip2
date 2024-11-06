<template>
  <div
    class="group flex items-center gap-2 border-r border-gray-200 bg-gray-50 px-4 py-2 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    :class="{ 'bg-white dark:bg-gray-700': isActive }"
  >
    <component :is="icon" class="h-4 w-4" />
    <span>{{ title }}</span>
    <button
      @click.stop="$emit('close')"
      class="invisible rounded-md p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 group-hover:visible dark:hover:bg-gray-600"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline';

defineProps<{
  title: string;
  icon: any;
  isActive: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>
