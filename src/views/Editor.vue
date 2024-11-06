<template>
  <div class="flex h-full w-full">
    <!-- Activity Menu -->
    <ActivityMenu :active-view="activeView" @view-change="setActiveView" />

    <!-- Left Sidebar -->
    <div
      class="flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
      :class="[settingsStore.sidebarCollapsed ? 'w-12' : 'w-64']"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
      >
        <h2
          class="text-lg font-semibold"
          :class="{ 'sr-only': settingsStore.sidebarCollapsed }"
        >
          Components
        </h2>
        <button
          @click="toggleSidebar"
          class="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          :title="
            settingsStore.sidebarCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          "
        >
          <ChevronLeftIcon
            v-if="!settingsStore.sidebarCollapsed"
            class="h-5 w-5"
          />
          <ChevronRightIcon v-else class="h-5 w-5" />
        </button>
      </div>
      <div
        class="flex-1 overflow-y-auto"
        :class="{ 'sr-only': settingsStore.sidebarCollapsed }"
      >
        <ComponentLibrary v-if="activeView === 'explorer'" />
        <SettingsPanel v-else-if="activeView === 'settings'" />
      </div>
      <ComponentVersions
        v-if="
          store.activeComponent &&
          !settingsStore.sidebarCollapsed &&
          activeView === 'explorer'
        "
      />
    </div>

    <!-- Middle Section - Monaco Editor -->
    <div class="flex-1 overflow-hidden">
      <CodeEditor />
    </div>

    <!-- Resize Handle -->
    <div
      class="hover-handle cursor-col-resize bg-gray-200 hover:bg-blue-500 dark:bg-gray-700 dark:hover:bg-blue-600"
      @mousedown="startResize"
    ></div>

    <!-- Right Preview Panel -->
    <div
      ref="previewPanel"
      class="border-l border-gray-200 bg-white transition-all duration-75 dark:border-gray-700 dark:bg-gray-800"
      :style="{ width: `${settingsStore.previewWidth}px` }"
    >
      <PreviewPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import { useSettingsStore } from '../stores/settings';
import ActivityMenu from '../components/ActivityMenu.vue';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import ComponentVersions from '../components/ComponentVersions.vue';
import CodeEditor from '../components/CodeEditor.vue';
import PreviewPanel from '../components/PreviewPanel.vue';
import SettingsPanel from '../components/SettingsPanel.vue';

const store = useComponentStore();
const settingsStore = useSettingsStore();
const previewPanel = ref<HTMLElement | null>(null);
const minWidth = 320;
const maxWidth = 800;
let isResizing = false;

const activeView = ref('explorer');

const setActiveView = (id: string) => {
  activeView.value = id;
};

// Load settings when component mounts
onMounted(async () => {
  await settingsStore.loadSettings();
});

const toggleSidebar = () => {
  settingsStore.setSidebarCollapsed(!settingsStore.sidebarCollapsed);
};

const startResize = (event: MouseEvent) => {
  isResizing = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.userSelect = 'none';
};

const handleResize = (event: MouseEvent) => {
  if (!isResizing || !previewPanel.value) return;

  const containerRect =
    previewPanel.value.parentElement?.getBoundingClientRect();
  if (!containerRect) return;

  const newWidth = containerRect.right - event.clientX;
  const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
  settingsStore.setPreviewWidth(constrainedWidth);
};

const stopResize = () => {
  isResizing = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.userSelect = '';
};

onBeforeUnmount(() => {
  if (isResizing) {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }
});
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

.hover-handle {
  width: 4px;
  transition: background-color 0.2s;
}

.hover-handle:active {
  width: 4px;
  background-color: rgb(59, 130, 246);
}

.selecting-none {
  user-select: none;
}
</style>
