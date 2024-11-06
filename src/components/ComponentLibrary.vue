<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Components</h2>
        <button
          @click="showCreateModal = true"
          class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          New
        </button>
      </div>
      <div class="mt-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search components..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
        />
      </div>
      <div class="mt-2">
        <select
          v-model="selectedCategory"
          class="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="">All Categories</option>
          <option value="buttons">Buttons</option>
          <option value="cards">Cards</option>
          <option value="forms">Forms</option>
          <option value="navigation">Navigation</option>
          <option value="layout">Layout</option>
        </select>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div
        v-if="filteredComponents.length === 0"
        class="text-center text-gray-500"
      >
        No components found
      </div>
      <div
        v-for="component in sortedComponents"
        :key="component.id"
        @click="selectComponent(component)"
        class="group mb-3 cursor-pointer rounded-md border border-gray-200 p-3 hover:border-blue-500 dark:border-gray-700"
        :class="{
          'border-blue-500': store.activeComponent?.id === component.id,
        }"
        @contextmenu.prevent="openContextMenu($event, component)"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-medium">{{ component.name }}</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ component.description }}
            </p>
          </div>
          <div class="invisible flex gap-1 group-hover:visible">
            <button
              @click.stop="duplicateComponent(component)"
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <DocumentDuplicateIcon class="h-5 w-5" />
            </button>
            <button
              @click.stop="deleteComponent(component.id)"
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="mt-2 flex flex-col gap-2">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in component.tags"
              :key="tag"
              class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ tag }}
            </span>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            Created {{ formatDate(component.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <CreateComponentModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
    />

    <Teleport to="body">
      <ComponentContextMenu
        v-if="showContextMenu"
        :component="contextMenuComponent!"
        :initial-position="contextMenuPosition"
        @close="closeContextMenu"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrashIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import type { Component } from '../types/component';
import CreateComponentModal from './CreateComponentModal.vue';
import ComponentContextMenu from './ComponentContextMenu.vue';

const store = useComponentStore();
const searchQuery = ref('');
const showCreateModal = ref(false);
const selectedCategory = ref('');

// Context menu state
const showContextMenu = ref(false);
const contextMenuComponent = ref<Component | null>(null);
const contextMenuPosition = ref({ x: 0, y: 0 });

const filteredComponents = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return store.components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory =
      !selectedCategory.value || component.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

const sortedComponents = computed(() => {
  return [...filteredComponents.value].sort((a, b) => {
    // // If one of the components is active, keep its position
    // if (store.activeComponent?.id === a.id) return -1;
    // if (store.activeComponent?.id === b.id) return 1;

    // Otherwise sort by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const selectComponent = (component: Component) => {
  store.setActiveComponent(component);
};

const deleteComponent = (id: string) => {
  if (confirm('Are you sure you want to delete this component?')) {
    store.deleteComponent(id);
  }
};

const duplicateComponent = (component: Component) => {
  store.duplicateComponent(component);
};

const openContextMenu = (event: MouseEvent, component: Component) => {
  // Close any existing context menu first
  showContextMenu.value = false;

  // Set new context menu data
  contextMenuComponent.value = component;
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY,
  };

  // Show the menu on next tick to ensure clean mounting
  setTimeout(() => {
    showContextMenu.value = true;
  }, 0);
};

const closeContextMenu = () => {
  showContextMenu.value = false;
  contextMenuComponent.value = null;
};

// Load components when the component is mounted
store.fetchComponents();
</script>
