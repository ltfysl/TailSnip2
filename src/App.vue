<template>
  <div class="flex h-screen overflow-hidden">
    <Notification />
    <ActivityMenu :active-view="activeView" @view-change="handleViewChange" />

    <div class="flex flex-1 flex-col">
      <!-- Tabs -->
      <div
        class="flex border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <Tab
          v-for="tab in openTabs"
          :key="tab.id"
          :title="tab.title"
          :icon="tab.icon"
          :is-active="activeTab === tab.id"
          :closeable="tab.id !== 'editor'"
          @click="setActiveTab(tab.id)"
          @close="closeTab(tab.id)"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <template v-if="activeTab === 'editor'">
          <Editor />
        </template>
        <Overview
          v-else-if="activeTab === 'overview'"
          @view-change="handleViewChange"
        />
        <Bookmarks
          v-else-if="activeTab === 'bookmarks'"
          @view-change="handleViewChange"
        />
      </div>
    </div>

    <!-- Settings Modal -->
    <TransitionRoot appear :show="showSettings" as="template">
      <Dialog as="div" @close="showSettings = false" class="relative z-50">
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
              >
                <DialogTitle as="h3" class="text-lg font-medium leading-6">
                  Settings
                </DialogTitle>
                <SettingsPanel />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Notification from './components/Notification.vue';
import ActivityMenu from './components/ActivityMenu.vue';
import Overview from './components/Overview.vue';
import Bookmarks from './components/Bookmarks.vue';
import Editor from './views/Editor.vue';
import Tab from './components/Tab.vue';
import {
  DocumentTextIcon,
  Squares2X2Icon,
  BookmarkIcon,
  PencilSquareIcon,
  ViewColumnsIcon,
} from '@heroicons/vue/24/outline';
import { useComponentStore } from './stores/components';
import { useSettingsStore } from './stores/settings';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import SettingsPanel from './components/SettingsPanel.vue';

const store = useComponentStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const activeView = ref('explorer');
const activeTab = ref('editor');
const showSettings = ref(false);
const openTabs = ref([
  { id: 'editor', title: 'Editor', icon: PencilSquareIcon },
]);

const tabs = {
  editor: {
    id: 'editor',
    title: 'Editor',
    icon: DocumentTextIcon,
    closeable: false,
  },
  overview: {
    id: 'overview',
    title: 'Overview',
    icon: Squares2X2Icon,
    closeable: true,
  },
  bookmarks: {
    id: 'bookmarks',
    title: 'Bookmarks',
    icon: BookmarkIcon,
    closeable: true,
  },
};

const handleViewChange = (id: string) => {
  activeView.value = id;
  console.log(id, activeTab.value);

  if (id === 'settings') {
    showSettings.value = true;
    return;
  }

  // Handle special views that should open as tabs
  if (id === 'overview') {
    // Check if overview tab already exists
    if (!openTabs.value.find((tab) => tab.id === 'overview')) {
      openTabs.value.push({
        id: 'overview',
        title: 'Overview',
        icon: ViewColumnsIcon,
      });
    }
    activeTab.value = 'overview';
  } else if (id === 'explorer') {
    // Switch back to editor tab when explorer is clicked
    activeTab.value = 'editor';
  } else if (id === 'bookmarks') {
    // Check if bookmarks tab already exists
    if (!openTabs.value.find((tab) => tab.id === 'bookmarks')) {
      openTabs.value.push({
        id: 'bookmarks',
        title: 'Bookmarks',
        icon: BookmarkIcon,
      });
    }
    activeTab.value = 'bookmarks';
  }
};
// const handleViewChange = (view: string) => {
//   activeView.value = view;

//   if (view === 'explorer') {
//     setActiveTab('editor');
//   } else if (view === 'overview' && !openTabs.value.includes('overview')) {
//     openTabs.value.push('overview');
//     setActiveTab('overview');
//   } else if (view === 'bookmarks' && !openTabs.value.includes('bookmarks')) {
//     openTabs.value.push('bookmarks');
//     setActiveTab('bookmarks');
//   }
// };

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
  if (tabId === 'editor') {
    activeView.value = 'explorer';
  } else if (tabId === 'overview') {
    activeView.value = 'overview';
  } else if (tabId === 'bookmarks') {
    activeView.value = 'bookmarks';
  }
};

const closeTab = (tabId: string) => {
  // Don't allow closing the editor tab
  if (tabId === 'editor') return;

  const index = openTabs.value.findIndex((tab) => tab.id === tabId);
  if (index !== -1) {
    openTabs.value.splice(index, 1);
    // If we're closing the active tab, switch to editor
    if (activeTab.value === tabId) {
      activeTab.value = 'editor';
    }
  }
};

// Load settings when component mounts
onMounted(async () => {
  await settingsStore.loadSettings();
  // Restore last active tab if saved
  if (settingsStore.lastActiveTab) {
    activeTab.value = settingsStore.lastActiveTab;
  }
});

// Watch for tab changes and save to settings
watch(activeTab, async (newTab) => {
  await settingsStore.setLastActiveTab(newTab);
});
</script>
