<template>
  <div class="flex h-full w-full">
    <!-- Left Sidebar -->
    <div
      class="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex-1 overflow-y-auto">
        <ComponentLibrary />
      </div>
      <ComponentVersions v-if="store.activeComponent" />
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
import { useComponentStore } from '../stores/components';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import ComponentVersions from '../components/ComponentVersions.vue';
import CodeEditor from '../components/CodeEditor.vue';
import PreviewPanel from '../components/PreviewPanel.vue';

const store = useComponentStore();
</script>
