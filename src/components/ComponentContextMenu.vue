<template>
  <div>
    <div
      ref="contextMenuRef"
      v-show="isVisible"
      :style="menuPosition"
      class="fixed z-50 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      @click.stop
    >
      <div class="py-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="handleAction(item.action)"
          :class="[
            'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
            item.danger
              ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
          ]"
        >
          <component
            :is="item.icon"
            class="h-4 w-4"
            :class="
              item.danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            "
          />
          {{ item.label }}
          <span
            v-if="item.shortcut"
            class="ml-auto text-xs text-gray-400 dark:text-gray-500"
            >{{ item.shortcut }}</span
          >
        </button>
      </div>
    </div>

    <EditComponentModal
      v-if="showEditModal"
      :is-open="showEditModal"
      :component="component"
      @close="closeEditModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClipboardIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline';
import type { Component } from '../types/component';
import { useComponentStore } from '../stores/components';
import { useNotificationStore } from '../stores/notifications';
import EditComponentModal from './EditComponentModal.vue';

const props = defineProps<{
  component: Component;
  initialPosition: { x: number; y: number };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useComponentStore();
const notificationStore = useNotificationStore();
const contextMenuRef = ref<HTMLElement | null>(null);
const isVisible = ref(true);
const position = ref({ x: 0, y: 0 });
const showEditModal = ref(false);

// Compute menu position with safe defaults
const menuPosition = computed(() => ({
  top: `${position.value.y}px`,
  left: `${position.value.x}px`,
}));

const menuItems = [
  {
    id: 'edit',
    label: 'Edit',
    icon: PencilIcon,
    action: 'edit',
    shortcut: '⏎',
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: DocumentDuplicateIcon,
    action: 'duplicate',
    shortcut: '⌘D',
  },
  {
    id: 'copy',
    label: 'Copy Code',
    icon: ClipboardIcon,
    action: 'copy',
  },
  {
    id: 'tags',
    label: 'Edit Tags',
    icon: TagIcon,
    action: 'tags',
  },
  {
    id: 'export',
    label: 'Export',
    icon: ArrowTopRightOnSquareIcon,
    action: 'export',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: TrashIcon,
    action: 'delete',
    shortcut: '⌫',
    danger: true,
  },
];

const handleAction = async (action: string) => {
  switch (action) {
    case 'edit':
      showEditModal.value = true;
      break;
    case 'duplicate':
      await store.duplicateComponent(props.component);
      emit('close');
      break;
    case 'copy':
      await navigator.clipboard.writeText(props.component.code);
      notificationStore.addNotification('Code copied to clipboard');
      emit('close');
      break;
    case 'delete':
      if (confirm('Are you sure you want to delete this component?')) {
        await store.deleteComponent(props.component.id);
      }
      emit('close');
      break;
    case 'export':
      // TODO: Implement export functionality
      emit('close');
      break;
    case 'tags':
      // TODO: Implement tags editing
      emit('close');
      break;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  emit('close');
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    contextMenuRef.value &&
    !contextMenuRef.value.contains(event.target as Node) &&
    !showEditModal.value // Don't close if edit modal is open
  ) {
    emit('close');
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !showEditModal.value) {
    emit('close');
  }
};

const updatePosition = () => {
  if (!contextMenuRef.value) return;

  const rect = contextMenuRef.value.getBoundingClientRect();
  const x = Math.min(
    props.initialPosition.x,
    window.innerWidth - rect.width - 10
  );
  const y = Math.min(
    props.initialPosition.y,
    window.innerHeight - rect.height - 10
  );
  position.value = { x, y };
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);

  // Initialize position after component is mounted
  nextTick(() => {
    position.value = { ...props.initialPosition };
    updatePosition();
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
