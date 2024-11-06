<template>
  <div
    class="group flex cursor-pointer items-center gap-2 border-r border-t-2 border-gray-200 bg-gray-50 px-4 py-2 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    :class="[
      isActive
        ? 'border-t-blue-500 bg-white dark:bg-gray-700'
        : 'border-t-transparent hover:border-t-gray-300 dark:hover:border-t-gray-600',
    ]"
    @click="$emit('click')"
  >
    <component
      :is="icon"
      class="h-4 w-4"
      :class="[
        isActive
          ? 'text-blue-500 dark:text-blue-400'
          : 'text-gray-500 dark:text-gray-400',
      ]"
    />
    <span :class="{ 'text-blue-600 dark:text-blue-400': isActive }">
      {{ title }}
    </span>
    <button
      v-if="closeable"
      @click.stop="$emit('close')"
      class="invisible rounded-md p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 group-hover:visible dark:hover:bg-gray-600 dark:hover:text-gray-300"
      title="Close tab"
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
  closeable?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
  (e: 'close'): void;
}>();
</script>
