<template>
  <TransitionRoot appear :show="notifications.length > 0" as="template">
    <div class="fixed right-4 top-4 z-50 space-y-2">
      <TransitionGroup
        enter="transform ease-out duration-300"
        enter-from="translate-y-2 opacity-0"
        enter-to="translate-y-0 opacity-100"
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'flex items-center justify-between rounded-lg p-4 shadow-lg',
            notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white',
          ]"
        >
          <span class="text-sm font-medium">{{ notification.message }}</span>
          <button
            type="button"
            @click="removeNotification(notification.id)"
            class="ml-4 rounded-md p-1 hover:bg-white/20"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionGroup } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { useNotificationStore } from '../stores/notifications';

const notificationStore = useNotificationStore();
const { notifications } = notificationStore;

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id);
};
</script>
