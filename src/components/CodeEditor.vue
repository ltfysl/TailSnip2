<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          {{ store.activeComponent?.name || 'Editor' }}
        </h2>
        <div class="flex gap-2">
          <button
            @click="saveComponent"
            class="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
            :disabled="!store.activeComponent"
          >
            <span class="flex items-center gap-1">
              Save
              <span class="text-xs opacity-75">
                (<kbd v-if="isMac">⌘</kbd><kbd v-else>Ctrl</kbd> + <kbd>S</kbd>)
              </span>
            </span>
          </button>
          <button
            @click="exportAsHTML"
            class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            :disabled="!store.activeComponent"
          >
            Export HTML
          </button>
          <button
            @click="exportAsVue"
            class="rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
            :disabled="!store.activeComponent"
          >
            Export Vue
          </button>
          <button
            @click="formatDocument"
            class="rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
            :disabled="!store.activeComponent"
          >
            <span class="flex items-center gap-1">
              Format
              <span class="text-xs opacity-75">
                (<kbd v-if="isMac">⌘</kbd><kbd v-else>Ctrl</kbd> +
                <kbd>Shift</kbd> + <kbd>F</kbd>)
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
    <div ref="editorContainer" class="flex-1"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useComponentStore } from '../stores/components';
import { useNotificationStore } from '../stores/notifications';
import { exportComponent } from '../utils/export';

const store = useComponentStore();
const notificationStore = useNotificationStore();
const editorContainer = ref<HTMLElement | null>(null);
let editor: any = null;
let autoSaveTimeout: number | null = null;
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const debouncedUpdate = (newCode: string) => {
  if (autoSaveTimeout) {
    window.clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = window.setTimeout(async () => {
    if (store.activeComponent) {
      try {
        await store.updateComponent(store.activeComponent.id, {
          code: newCode,
        });
        window.dispatchEvent(
          new CustomEvent('component-code-updated', { detail: newCode })
        );
      } catch (error) {
        console.error('Failed to update component:', error);
        notificationStore.addNotification(
          'Failed to auto-save changes',
          'error'
        );
      }
    }
  }, 100);
};

onMounted(async () => {
  if (!editorContainer.value) return;

  // Dynamically import Monaco Editor
  const monaco = await import('monaco-editor');

  editor = monaco.editor.create(editorContainer.value, {
    value: store.activeComponent?.code || '',
    language: 'html',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    contextmenu: false,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    formatOnType: true,
    suggestOnTriggerCharacters: true,
  });

  monaco.languages.html.htmlDefaults.setOptions({
    format: {
      tabSize: 2,
      insertSpaces: true,
    },
    suggest: {
      html5: true,
    },
  });

  editor.onDidChangeModelContent(() => {
    if (editor && store.activeComponent) {
      const newCode = editor.getValue();
      debouncedUpdate(newCode);
    }
  });

  setupKeyboardShortcuts();
});

const setupKeyboardShortcuts = () => {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveComponent();
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      formatDocument();
    }
  });
};

onBeforeUnmount(() => {
  if (autoSaveTimeout) {
    window.clearTimeout(autoSaveTimeout);
  }
  if (editor) {
    editor.dispose();
  }
});

watch(
  () => store.activeComponent,
  (newComponent) => {
    if (editor && newComponent) {
      editor.setValue(newComponent.code);
    }
  }
);

const saveComponent = async () => {
  try {
    if (editor && store.activeComponent) {
      const newCode = editor.getValue();
      await store.updateComponent(store.activeComponent.id, {
        code: newCode,
      });
      notificationStore.addNotification('Component saved successfully');
    }
  } catch (error) {
    notificationStore.addNotification('Failed to save component', 'error');
  }
};

const exportAsHTML = () => {
  try {
    if (editor) {
      const code = editor.getValue();
      exportComponent(code, 'html');
      notificationStore.addNotification('Component exported as HTML');
    }
  } catch (error) {
    notificationStore.addNotification('Failed to export component', 'error');
  }
};

const exportAsVue = () => {
  try {
    if (editor && store.activeComponent) {
      const code = `<template>\n${editor.getValue()}\n</template>`;
      exportComponent(code, 'vue');
      notificationStore.addNotification('Component exported as Vue component');
    }
  } catch (error) {
    notificationStore.addNotification('Failed to export component', 'error');
  }
};

const formatDocument = async () => {
  if (editor) {
    editor.trigger('editor', 'editor.action.formatDocument');
  }
};
</script>

<style>
.monaco-editor {
  padding-top: 8px;
}

.monaco-editor .overflow-guard {
  border-radius: 6px;
}
</style>
