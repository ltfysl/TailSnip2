<template>
  <div
    class="flex h-full w-14 flex-col items-center border-r border-gray-200 bg-gray-900 py-2 dark:border-gray-700"
  >
    <!-- Main Activity Items -->
    <div class="flex flex-col items-center space-y-2 px-2">
      <button
        v-for="item in mainItems"
        :key="item.id"
        class="relative flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-colors"
        :class="[
          activeView === item.id
            ? 'bg-gray-800 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
        ]"
        :title="item.title"
        @click="$emit('viewChange', item.id)"
      >
        <component :is="item.icon" class="h-full w-full" />
        <span
          v-if="item.badge"
          class="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
        >
          {{ item.badge }}
        </span>
      </button>
    </div>

    <!-- Settings (Bottom) -->
    <div class="mt-auto">
      <button
        @click="$emit('viewChange', 'settings')"
        class="flex h-12 w-12 items-center justify-center rounded-lg p-3 transition-colors"
        :class="[
          activeView === 'settings'
            ? 'bg-gray-800 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
        ]"
        title="Settings"
      >
        <Cog6ToothIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  BookmarkIcon,
  CommandLineIcon,
  CubeIcon,
  Squares2X2Icon,
} from '@heroicons/vue/24/outline';

defineProps<{
  activeView: string;
}>();

defineEmits<{
  (e: 'viewChange', view: string): void;
}>();

const mainItems = [
  { id: 'explorer', icon: DocumentTextIcon, title: 'Component Explorer' },
  { id: 'bookmarks', icon: BookmarkIcon, title: 'Bookmarks' },
  { id: 'overview', icon: Squares2X2Icon, title: 'Overview' },
  { id: 'terminal', icon: CommandLineIcon, title: 'Terminal' },
  { id: 'extensions', icon: CubeIcon, title: 'Extensions', badge: '2' },
];
</script>
