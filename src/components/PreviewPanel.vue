<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Preview</h2>
        <div class="flex gap-2">
          <button
            @click="toggleTheme"
            class="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {{ isDark ? 'Light' : 'Dark' }} Mode
          </button>
          <button
            @click="toggleTabView"
            class="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            :title="isTabView ? 'Switch to Split View' : 'Switch to Tab View'"
          >
            {{ isTabView ? 'Split View' : 'Tab View' }}
          </button>
          <button
            @click="toggleSize"
            class="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {{ previewSize }}
          </button>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-auto p-4">
      <div
        :class="[
          'preview-container mx-auto h-full transition-all',
          {
            'w-full': previewSize === 'Full',
            'max-w-md': previewSize === 'Mobile',
            'max-w-xl': previewSize === 'Tablet',
          },
        ]"
      >
        <iframe
          ref="previewFrame"
          :class="[
            'preview-content h-full w-full rounded-lg',
            { dark: isDark },
          ]"
          sandbox="allow-scripts"
          :srcdoc="previewContent"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useComponentStore } from '../stores/components';
import DOMPurify from 'dompurify';
import { getPreviewStyles, initializeTailwindStyles } from '../preview-styles';
import { useEventBus, EventNames } from '../utils/eventbus';

const store = useComponentStore();
const eventBus = useEventBus();
const isDark = ref(false);
const isTabView = ref(false);
const previewSize = ref<'Mobile' | 'Tablet' | 'Full'>('Full');
const previewFrame = ref<HTMLIFrameElement | null>(null);

const previewContent = computed(() => {
  const code = store.activeComponent?.code || '';
  const sanitizedCode = DOMPurify.sanitize(code);
  const styles = getPreviewStyles();

  return `
    <!DOCTYPE html>
    <html class="${isDark.value ? 'dark' : ''}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${styles}</style>
      </head>
      <body class="${isDark.value ? 'dark' : ''}">
        ${sanitizedCode}
      </body>
    </html>
  `;
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
};

const toggleTabView = () => {
  isTabView.value = !isTabView.value;
  eventBus.emit(EventNames.PREVIEW_RESIZE, isTabView.value);
};

const toggleSize = () => {
  const sizes: ('Mobile' | 'Tablet' | 'Full')[] = ['Mobile', 'Tablet', 'Full'];
  const currentIndex = sizes.indexOf(previewSize.value);
  previewSize.value = sizes[(currentIndex + 1) % sizes.length];
};

// Listen for real-time code updates
const handleCodeUpdate = (event: CustomEvent) => {
  if (previewFrame.value) {
    const code = event.detail;
    const sanitizedCode = DOMPurify.sanitize(code);
    const styles = getPreviewStyles();

    previewFrame.value.srcdoc = `
      <!DOCTYPE html>
      <html class="${isDark.value ? 'dark' : ''}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${styles}</style>
        </head>
        <body class="${isDark.value ? 'dark' : ''}">
          ${sanitizedCode}
        </body>
      </html>
    `;
  }
};

onMounted(async () => {
  // Initialize Tailwind styles when component mounts
  await initializeTailwindStyles();
  window.addEventListener(
    'component-code-updated',
    handleCodeUpdate as EventListener
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    'component-code-updated',
    handleCodeUpdate as EventListener
  );
});

// Watch for active component changes
watch(
  () => store.activeComponent?.code,
  () => {
    if (previewFrame.value) {
      previewFrame.value.srcdoc = previewContent.value;
    }
  }
);
</script>

<style>
.preview-container {
  @apply rounded-lg border border-gray-200 p-4 dark:border-gray-700;
}

.preview-content {
  @apply transition-colors;
  border: none;
  min-height: calc(100vh - 8rem);
}
</style>
