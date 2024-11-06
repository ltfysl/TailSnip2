<template>
  <div class="border-t border-gray-200 dark:border-gray-700">
    <button
      @click="isExpanded = !isExpanded"
      class="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium">Version History</h3>
        <span class="text-xs text-gray-500 dark:text-gray-400"
          >({{ store.componentVersions.length }})</span
        >
      </div>
      <ChevronUpIcon
        class="h-4 w-4 transform transition-transform"
        :class="{ 'rotate-180': !isExpanded }"
      />
    </button>

    <div
      v-show="isExpanded"
      class="overflow-hidden transition-all duration-300"
    >
      <div class="space-y-2 p-4 pt-0">
        <div
          v-if="store.componentVersions.length === 0"
          class="py-4 text-center text-sm text-gray-500"
        >
          No versions available
        </div>
        <div class="max-h-60 space-y-2 overflow-y-auto">
          <div
            v-for="version in store.componentVersions"
            :key="version.id"
            class="flex items-center justify-between rounded-md border border-gray-200 p-2 text-sm transition-colors hover:border-blue-500 dark:border-gray-700"
          >
            <div class="flex flex-col">
              <span class="text-xs text-gray-600 dark:text-gray-400">{{
                formatDate(version.createdAt)
              }}</span>
              <span class="mt-1 text-xs" v-if="version.id === currentVersionId"
                >(Current)</span
              >
            </div>
            <div class="flex gap-2">
              <button
                @click="previewVersion(version)"
                class="rounded-md bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Preview
              </button>
              <button
                @click="restoreVersion(version.id)"
                class="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                :disabled="version.id === currentVersionId"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
        <button
          @click="createVersion"
          class="mt-2 w-full rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
          :disabled="!hasChanges"
        >
          Save New Version
        </button>
      </div>
    </div>

    <TransitionRoot appear :show="isPreviewOpen" as="template">
      <Dialog as="div" @close="closePreview" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
              >
                <DialogTitle as="h3" class="mb-4 text-lg font-medium leading-6">
                  Version Preview
                </DialogTitle>
                <div class="rounded-md border bg-gray-50 p-4 dark:bg-gray-900">
                  <pre
                    class="overflow-x-auto text-sm"
                  ><code>{{ previewCode }}</code></pre>
                </div>
                <div class="mt-4 flex justify-end gap-2">
                  <button
                    @click="closePreview"
                    class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <button
                    @click="restorePreviewedVersion"
                    class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Restore This Version
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { ChevronUpIcon } from '@heroicons/vue/24/outline';
import { useComponentStore } from '../stores/components';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import type { ComponentVersion } from '../types/component';

const store = useComponentStore();
const isPreviewOpen = ref(false);
const previewCode = ref('');
const previewedVersionId = ref<string | null>(null);
const isExpanded = ref(true);

const currentVersionId = computed(() => {
  return store.componentVersions[0]?.id;
});

const hasChanges = computed(() => {
  if (!store.activeComponent || store.componentVersions.length === 0)
    return false;
  return store.activeComponent.code !== store.componentVersions[0].code;
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const createVersion = async () => {
  if (store.activeComponent && hasChanges.value) {
    await store.createVersion(
      store.activeComponent.id,
      store.activeComponent.code
    );
    await store.fetchComponentVersions(store.activeComponent.id);
  }
};

const restoreVersion = async (versionId: string) => {
  if (
    confirm(
      'Are you sure you want to restore this version? Current changes will be saved as a new version.'
    )
  ) {
    await store.restoreVersion(versionId);
    await nextTick();
    // Update both editor and preview
    window.dispatchEvent(
      new CustomEvent('version-restored', {
        detail: store.activeComponent?.code,
      })
    );
  }
};

const previewVersion = (version: ComponentVersion) => {
  previewCode.value = version.code;
  previewedVersionId.value = version.id;
  isPreviewOpen.value = true;
};

const closePreview = () => {
  isPreviewOpen.value = false;
  previewCode.value = '';
  previewedVersionId.value = null;
};

const restorePreviewedVersion = async () => {
  if (previewedVersionId.value) {
    await restoreVersion(previewedVersionId.value);
    closePreview();
  }
};
</script>
