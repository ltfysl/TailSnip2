<template>
  <div class="flex h-screen flex-col">
    <!-- Fixed Header -->
    <div
      class="flex-none border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold">Bookmarked Components</h2>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 dark:text-gray-400"
              >Category:</label
            >
            <select
              v-model="selectedCategory"
              class="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="">All Categories</option>
              <option value="buttons">Buttons</option>
              <option value="cards">Cards</option>
              <option value="forms">Forms</option>
              <option value="navigation">Navigation</option>
              <option value="layout">Layout</option>
            </select>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search bookmarks..."
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="min-h-0 flex-1 overflow-y-auto pb-40">
      <div class="p-6">
        <div
          v-if="filteredComponents.length === 0"
          class="flex flex-col items-center justify-center py-12"
        >
          <BookmarkIcon class="h-12 w-12 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">No bookmarked components</p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="component in filteredComponents"
            :key="component.id"
            class="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="border-b border-gray-200 p-4 dark:border-gray-700">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium">{{ component.name }}</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ component.description }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="
                      openComponent(component);
                      $emit('viewChange', 'explorer');
                    "
                    class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="tag in component.tags"
                  :key="tag"
                  class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="h-64 bg-gray-50 p-4 dark:bg-gray-900">
              <iframe
                :srcdoc="getPreviewContent(component.code)"
                class="h-full w-full rounded border-0 bg-white"
                sandbox="allow-scripts"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BookmarkIcon } from '@heroicons/vue/24/outline';
import { useBookmarksStore } from '../stores/bookmarks';
import { useComponentStore } from '../stores/components';
import { useRouter } from 'vue-router';
import type { Component } from '../types/component';
import { getPreviewStyles } from '../preview-styles';

defineEmits<{
  (e: 'viewChange', view: string): void;
}>();

const store = useComponentStore();
const bookmarksStore = useBookmarksStore();
const router = useRouter();
const searchQuery = ref('');
const selectedCategory = ref('');

const filteredComponents = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return bookmarksStore.bookmarkedComponents.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory =
      !selectedCategory.value || component.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

const getPreviewContent = (code: string) => {
  const styles = getPreviewStyles();
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${styles}</style>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;
};

const openComponent = async (component: Component) => {
  await store.setActiveComponent(component);
  router.push('/');
};

onMounted(() => {
  bookmarksStore.fetchBookmarkedComponents();
});
</script>
