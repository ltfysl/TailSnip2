<template>
  <div class="flex h-full w-full">
    <!-- Activity Menu -->
    <!-- <ActivityMenu :active-view="activeView" @view-change="handleViewChange" /> -->

    <!-- Main Content -->
    <div class="flex flex-1">
      <div
        v-if="!settingsStore.sidebarCollapsed"
        class="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex-1 overflow-y-auto">
          <ComponentLibrary />
        </div>
        <ComponentVersions v-if="store.activeComponent" />
      </div>

      <!-- Toggle Sidebar Button -->
      <button
        @click="toggleSidebar"
        class="flex items-center justify-center border-r border-gray-200 bg-white px-1 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <component
          :is="
            settingsStore.sidebarCollapsed ? ChevronRightIcon : ChevronLeftIcon
          "
          class="h-4 w-4"
        />
        <span class="sr-only">
          {{ settingsStore.sidebarCollapsed ? 'Show' : 'Hide' }} sidebar
        </span>
      </button>

      <!-- Main Content Area -->
      <div class="flex flex-1 flex-col">
        <!-- Tab Content -->
        <div class="flex-1">
          <div class="flex h-full">
            <!-- Editor -->
            <div class="flex-1">
              <CodeEditor />
            </div>

            <!-- Resize Handle -->
            <div
              class="hover-handle cursor-col-resize hover:bg-blue-200"
              @mousedown="startResize"
            ></div>

            <!-- Preview Panel -->
            <div
              ref="previewPanel"
              class="flex-shrink-0"
              :style="{ width: `${settingsStore.previewWidth}px` }"
            >
              <PreviewPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import { useSettingsStore } from '../stores/settings';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import ComponentVersions from '../components/ComponentVersions.vue';
import CodeEditor from '../components/CodeEditor.vue';
import PreviewPanel from '../components/PreviewPanel.vue';

const store = useComponentStore();
const settingsStore = useSettingsStore();
const previewPanel = ref<HTMLElement | null>(null);
const minWidth = 320;
const maxWidth = 800;
let isResizing = false;

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
