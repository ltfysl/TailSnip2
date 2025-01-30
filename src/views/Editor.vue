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
        class="flex items-center justify-center border-r border-gray-200 bg-white px-1 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        @click="toggleSidebar"
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
            <div
              v-if="store.activeComponent"
              class="flex-1"
              :class="{ hidden: isPreviewTabView }"
            >
              <CodeEditor />
            </div>
            <!-- Preview -->
            <div
              v-if="store.activeComponent && isPreviewTabView"
              class="flex-1"
            >
              <PreviewPanel />
            </div>
            <!-- Message when no component is selected -->
            <div
              v-if="!store.activeComponent"
              class="flex h-full w-full items-center justify-center"
            >
              <h1 class="text-2xl font-bold text-gray-500 dark:text-gray-300">
                Please Select a Component or create a new one
              </h1>
            </div>

            <!-- Resize Handle -->
            <div
              class="resizer-handle"
              :class="{ 'resizer-active': resizeState.isResizing }"
              role="separator"
              aria-orientation="vertical"
              :aria-valuenow="settingsStore.previewWidth"
              :aria-valuemin="minWidth"
              :aria-valuemax="maxWidth"
              @pointerdown="startResize"
            />
            <!-- Preview Panel -->
            <div
              v-if="store.activeComponent"
              ref="previewPanel"
              :class="['flex-shrink-0', { 'flex-1': isPreviewTabView }]"
              :style="previewStyle"
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
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import { useSettingsStore } from '../stores/settings';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import ComponentVersions from '../components/ComponentVersions.vue';
import CodeEditor from '../components/CodeEditor.vue';
import PreviewPanel from '../components/PreviewPanel.vue';
import { useEventBus, EventNames } from '../utils/eventbus';
import { reactive } from 'vue';

const store = useComponentStore();
const settingsStore = useSettingsStore();
const eventBus = useEventBus();
const previewPanel = ref<HTMLElement | null>(null);
const minWidth = 320;
const maxWidth = 800;
const isPreviewTabView = ref(false);

const previewStyle = computed(() => {
  if (isPreviewTabView.value) {
    return {};
  }
  return { width: `${settingsStore.previewWidth}px` };
});

// Load settings when component mounts
onMounted(async () => {
  await settingsStore.loadSettings();
  eventBus.on(EventNames.PREVIEW_RESIZE, (tabView: boolean) => {
    isPreviewTabView.value = tabView;
  });
});

const toggleSidebar = () => {
  settingsStore.setSidebarCollapsed(!settingsStore.sidebarCollapsed);
};

const resizeState = reactive({
  isResizing: false,
  startX: 0,
  startWidth: 0,
});

const startResize = (event: PointerEvent) => {
  resizeState.isResizing = true;
  resizeState.startX = event.clientX;
  resizeState.startWidth = settingsStore.previewWidth;

  window.addEventListener('pointermove', handleResize);
  window.addEventListener('pointerup', stopResize);
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
};

const handleResize = (event: PointerEvent) => {
  if (!resizeState.isResizing) return;

  const deltaX = event.clientX - resizeState.startX;
  const newWidth = resizeState.startWidth - deltaX;
  const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

  settingsStore.setPreviewWidth(clampedWidth);
};

const stopResize = () => {
  resizeState.isResizing = false;
  window.removeEventListener('pointermove', handleResize);
  window.removeEventListener('pointerup', stopResize);
};

watch(
  () => resizeState.isResizing,
  (resizing) => {
    document.body.classList.toggle('resizing-active', resizing);
    document.body.style.cursor = resizing ? 'col-resize' : '';
  }
);

onBeforeUnmount(() => {
  if (resizeState.isResizing) {
    window.removeEventListener('pointermove', handleResize);
    window.removeEventListener('pointerup', stopResize);
  }
  eventBus.off(EventNames.PREVIEW_RESIZE, () => {});
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

.resizer-handle {
  @apply w-1 cursor-col-resize bg-gray-300 transition-all hover:bg-blue-500;
  position: relative;
  z-index: 10;

  &:hover::after,
  &.resizer-active::after {
    content: '';
    @apply absolute inset-y-0 -left-1 w-3 bg-transparent;
  }
}

.resizer-active {
  @apply bg-blue-500;
}

body.resizing-active {
  user-select: none;
  -webkit-user-select: none;
}
</style>
