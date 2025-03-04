import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error';
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([]);

    const addNotification = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substring(7);
        notifications.value.push({ id, message, type });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id: string) => {
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
    };

    return {
        notifications,
        addNotification,
        removeNotification,
    };
});
