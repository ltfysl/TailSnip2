<template>
  <div class="flex h-full w-full">
    <!-- Left Sidebar -->
    <div
      class="flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
      :class="[sidebarCollapsed ? 'w-12' : 'w-64']"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
      >
        <h2
          class="text-lg font-semibold"
          :class="{ 'sr-only': sidebarCollapsed }"
        >
          Components
        </h2>
        <button
          @click="toggleSidebar"
          class="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <ChevronLeftIcon v-if="!sidebarCollapsed" class="h-5 w-5" />
          <ChevronRightIcon v-else class="h-5 w-5" />
        </button>
      </div>
      <div
        class="flex-1 overflow-y-auto"
        :class="{ 'sr-only': sidebarCollapsed }"
      >
        <ComponentLibrary />
      </div>
      <ComponentVersions v-if="store.activeComponent && !sidebarCollapsed" />
    </div>

    <!-- Middle Section - Monaco Editor -->
    <div class="flex-1 overflow-hidden">
      <CodeEditor />
    </div>

    <!-- Right Preview Panel -->
    <div
      class="w-96 flex-shrink-0 border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <PreviewPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import ComponentVersions from '../components/ComponentVersions.vue';
import CodeEditor from '../components/CodeEditor.vue';
import PreviewPanel from '../components/PreviewPanel.vue';

const store = useComponentStore();
const sidebarCollapsed = ref(false);

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
