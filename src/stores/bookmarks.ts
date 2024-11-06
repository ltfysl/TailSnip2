import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbManager } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { useNotificationStore } from './notifications';
import type { Component } from '../types/component';

export const useBookmarksStore = defineStore('bookmarks', () => {
    const bookmarkedComponents = ref<Component[]>([]);
    const notificationStore = useNotificationStore();

    const fetchBookmarkedComponents = async () => {
        try {
            const result = await dbManager.executeSelect(`
        SELECT c.*
        FROM components c
        INNER JOIN bookmarks b ON b.component_id = c.id
        ORDER BY b.created_at DESC
      `);

            bookmarkedComponents.value = result.map((row: any) => ({
                ...row,
                tags: JSON.parse(row.tags || '[]'),
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            }));
        } catch (error) {
            console.error('Error fetching bookmarked components:', error);
            throw error;
        }
    };

    const isBookmarked = async (componentId: string) => {
        try {
            const result = await dbManager.executeSelect(
                'SELECT id FROM bookmarks WHERE component_id = ?',
                [componentId]
            );
            return result.length > 0;
        } catch (error) {
            console.error('Error checking bookmark status:', error);
            return false;
        }
    };

    const addBookmark = async (componentId: string) => {
        try {
            await dbManager.executeQuery(
                'INSERT INTO bookmarks (id, component_id) VALUES (?, ?)',
                [uuidv4(), componentId]
            );
            await fetchBookmarkedComponents();
            notificationStore.addNotification('Component bookmarked');
        } catch (error) {
            console.error('Error adding bookmark:', error);
            notificationStore.addNotification('Failed to bookmark component', 'error');
            throw error;
        }
    };

    const removeBookmark = async (componentId: string) => {
        try {
            await dbManager.executeQuery(
                'DELETE FROM bookmarks WHERE component_id = ?',
                [componentId]
            );
            await fetchBookmarkedComponents();
            notificationStore.addNotification('Bookmark removed');
        } catch (error) {
            console.error('Error removing bookmark:', error);
            notificationStore.addNotification('Failed to remove bookmark', 'error');
            throw error;
        }
    };

    const toggleBookmark = async (componentId: string) => {
        const bookmarked = await isBookmarked(componentId);
        if (bookmarked) {
            await removeBookmark(componentId);
        } else {
            await addBookmark(componentId);
        }
    };

    return {
        bookmarkedComponents,
        fetchBookmarkedComponents,
        isBookmarked,
        toggleBookmark,
    };
});
