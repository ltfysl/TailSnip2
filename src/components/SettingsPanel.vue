<template>
  <div class="mt-4">
    <div class="space-y-4">
      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-3 text-sm font-medium">Database</h3>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="text"
              :value="settingsStore.databasePath"
              readonly
              class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            />
            <button
              @click="selectDatabasePath"
              class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              Change Location
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            The application will restart after changing the database location.
          </p>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-3 text-sm font-medium">Appearance</h3>
        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              :checked="settingsStore.sidebarCollapsed"
              @change="
                (e) => settingsStore.setSidebarCollapsed(e.target.checked)
              "
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Collapse Sidebar</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              :checked="settingsStore.versionHistoryExpanded"
              @change="
                (e) => settingsStore.setVersionHistoryExpanded(e.target.checked)
              "
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Expand Version History</span>
          </label>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-3 text-sm font-medium">Preview Panel</h3>
        <div class="space-y-2">
          <label class="block">
            <span class="text-sm">Width (px)</span>
            <input
              type="number"
              :value="settingsStore.previewWidth"
              @change="
                (e) => settingsStore.setPreviewWidth(parseInt(e.target.value))
              "
              min="320"
              max="800"
              step="10"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { ipcRenderer } from 'electron';

const settingsStore = useSettingsStore();

const selectDatabasePath = async () => {
  const result = await ipcRenderer.invoke('select-database-path');
  if (result) {
    await settingsStore.setDatabasePath(result);
  }
};
</script>
