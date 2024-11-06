<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Components</h2>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
        >
          <PlusIcon class="h-4 w-4" />
          New
        </button>
      </div>
      <div class="mt-4 space-y-2">
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search components..."
            class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <select
          v-model="selectedCategory"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
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

    <div class="flex-1 overflow-y-auto">
      <!-- Opened Component Section -->
      <div
        v-if="store.activeComponent"
        class="border-b border-gray-200 dark:border-gray-700"
      >
        <div class="px-3 py-2">
          <h3
            class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Opened Component
          </h3>
        </div>
        <div class="px-3 pb-3">
          <div
            class="group relative overflow-hidden rounded-lg border border-blue-500 bg-blue-50/50 transition-all dark:bg-blue-900/20"
            @contextmenu.prevent="
              openContextMenu($event, store.activeComponent)
            "
          >
            <div class="p-3">
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <h3
                    class="truncate font-medium"
                    :title="store.activeComponent.name"
                  >
                    {{ store.activeComponent.name }}
                  </h3>
                  <p
                    class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400"
                    :title="store.activeComponent.description"
                  >
                    {{ store.activeComponent.description }}
                  </p>
                </div>

                <div class="ml-4 flex-shrink-0">
                  <div class="invisible flex gap-1 group-hover:visible">
                    <button
                      @click.stop="duplicateComponent(store.activeComponent)"
                      class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="deleteComponent(store.activeComponent.id)"
                      class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                      title="Delete"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-2 flex flex-col gap-2">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in store.activeComponent.tags"
                    :key="tag"
                    class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500"
                >
                  <CalendarIcon class="h-3.5 w-3.5" />
                  <span>{{ formatDate(store.activeComponent.createdAt) }}</span>
                  <span class="h-1 w-1 rounded-full bg-current"></span>
                  <FolderIcon class="h-3.5 w-3.5" />
                  <span class="capitalize">{{
                    store.activeComponent.category
                  }}</span>
                </div>
              </div>
            </div>

            <div class="absolute inset-y-0 left-0 w-1 bg-blue-500"></div>
          </div>
        </div>
      </div>

      <!-- Other Components Section -->
      <div class="px-3 py-2">
        <h3
          class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          All Components
        </h3>
      </div>

      <div class="p-3 pt-0">
        <div
          v-if="sortedComponents.length === 0"
          class="flex flex-col items-center justify-center py-12"
        >
          <DocumentIcon class="h-12 w-12 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">No components found</p>
        </div>

        <div class="space-y-2">
          <div
            v-for="component in sortedComponents.filter(
              (c) => c.id !== store.activeComponent?.id
            )"
            :key="component.id"
            @click="selectComponent(component)"
            @contextmenu.prevent="openContextMenu($event, component)"
            class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50"
          >
            <div class="p-3">
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <h3 class="truncate font-medium" :title="component.name">
                    {{ component.name }}
                  </h3>
                  <p
                    class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400"
                    :title="component.description"
                  >
                    {{ component.description }}
                  </p>
                </div>

                <div class="ml-4 flex-shrink-0">
                  <div class="invisible flex gap-1 group-hover:visible">
                    <button
                      class="rounded-md p-1 transition-colors"
                      :class="[
                        isBookmarked(component.id)
                          ? 'text-yellow-500 hover:bg-yellow-500 dark:hover:bg-yellow-900/20'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500 dark:hover:bg-gray-700',
                      ]"
                      :title="
                        isBookmarked(component.id)
                          ? 'Remove bookmark'
                          : 'Add bookmark'
                      "
                      @click.stop="toggleBookmark(component)"
                    >
                      <BookmarkIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="duplicateComponent(component)"
                      class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="deleteComponent(component.id)"
                      class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                      title="Delete"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-2 flex flex-col gap-2">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in component.tags"
                    :key="tag"
                    class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500"
                >
                  <CalendarIcon class="h-3.5 w-3.5" />
                  <span>{{ formatDate(component.createdAt) }}</span>
                  <span class="h-1 w-1 rounded-full bg-current"></span>
                  <FolderIcon class="h-3.5 w-3.5" />
                  <span class="capitalize">{{ component.category }}</span>
                </div>
              </div>
            </div>

            <div
              class="absolute inset-y-0 left-0 w-1 bg-transparent transition-colors group-hover:bg-blue-200 dark:group-hover:bg-blue-500/50"
            ></div>
          </div>
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
import {
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  CalendarIcon,
  FolderIcon,
} from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import type { Component } from '../types/component';
import CreateComponentModal from './CreateComponentModal.vue';
import ComponentContextMenu from './ComponentContextMenu.vue';
import { BookmarkIcon } from '@heroicons/vue/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/vue/24/solid';
import { useBookmarksStore } from '../stores/bookmarks';

const bookmarksStore = useBookmarksStore();
const store = useComponentStore();
const searchQuery = ref('');
const showCreateModal = ref(false);
const selectedCategory = ref('');

// Context menu state
const showContextMenu = ref(false);
const contextMenuComponent = ref<Component | null>(null);
const contextMenuPosition = ref({ x: 0, y: 0 });

const sortedComponents = computed(() => {
  const filtered = store.components.filter((component) => {
    const query = searchQuery.value.toLowerCase();
    const matchesSearch =
      component.name.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory =
      !selectedCategory.value || component.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });

  return filtered.sort((a, b) => {
    // If one of the components is active, keep its position
    if (store.activeComponent?.id === a.id) return -1;
    if (store.activeComponent?.id === b.id) return 1;

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

const isBookmarked = async (componentId: string) => {
  let isBookmarked = await bookmarksStore.isBookmarked(componentId);
  console.log(isBookmarked);
  return isBookmarked;
};

const toggleBookmark = async (component: Component) => {
  await bookmarksStore.toggleBookmark(component.id);
};
</script>
