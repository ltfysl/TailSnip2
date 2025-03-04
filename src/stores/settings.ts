import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbManager } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { ipcRenderer } from 'electron';
import { useNotificationStore } from './notifications';

export const useSettingsStore = defineStore('settings', () => {
    const sidebarCollapsed = ref(false);
    const versionHistoryExpanded = ref(true);
    const previewWidth = ref(384);
    const lastActiveTab = ref('editor');
    const databasePath = ref('');
    const notificationStore = useNotificationStore();

    const loadSettings = async () => {
        try {
            const results = await dbManager.executeSelect(
                'SELECT setting_key, setting_value FROM ui_settings'
            );

            results.forEach((row: { setting_key: string; setting_value: string }) => {
                switch (row.setting_key) {
                    case 'sidebarCollapsed':
                        sidebarCollapsed.value = row.setting_value === 'true';
                        break;
                    case 'versionHistoryExpanded':
                        versionHistoryExpanded.value = row.setting_value === 'true';
                        break;
                    case 'previewWidth':
                        previewWidth.value = parseInt(row.setting_value, 10);
                        break;
                    case 'lastActiveTab':
                        lastActiveTab.value = row.setting_value;
                        break;
                    case 'databasePath':
                        databasePath.value = row.setting_value;
                        break;
                }
            });

            // Get current database path if not set
            if (!databasePath.value) {
                databasePath.value = await ipcRenderer.invoke('get-database-path');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSetting = async (key: string, value: string | number | boolean) => {
        try {
            const stringValue = value.toString();
            const now = new Date().toISOString();

            await dbManager.executeQuery(
                `INSERT INTO ui_settings (id, setting_key, setting_value, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(setting_key) DO UPDATE SET
         setting_value = excluded.setting_value,
         updated_at = excluded.updated_at`,
                [uuidv4(), key, stringValue, now]
            );
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    };

    const setSidebarCollapsed = async (value: boolean) => {
        sidebarCollapsed.value = value;
        await saveSetting('sidebarCollapsed', value);
    };

    const setVersionHistoryExpanded = async (value: boolean) => {
        versionHistoryExpanded.value = value;
        await saveSetting('versionHistoryExpanded', value);
    };

    const setPreviewWidth = async (value: number) => {
        previewWidth.value = value;
        await saveSetting('previewWidth', value);
    };

    const setLastActiveTab = async (value: string) => {
        lastActiveTab.value = value;
        await saveSetting('lastActiveTab', value);
    };

    const setDatabasePath = async (value: string) => {
        try {
            const success = await ipcRenderer.invoke('set-database-path', value);
            if (success) {
                databasePath.value = value;
                await saveSetting('databasePath', value);
                notificationStore.addNotification('Database location changed. Application will restart...');
            } else {
                notificationStore.addNotification('Failed to change database location', 'error');
            }
        } catch (error) {
            console.error('Error setting database path:', error);
            notificationStore.addNotification('Failed to change database location', 'error');
        }
    };

    return {
        sidebarCollapsed,
        versionHistoryExpanded,
        previewWidth,
        lastActiveTab,
        databasePath,
        loadSettings,
        setSidebarCollapsed,
        setVersionHistoryExpanded,
        setPreviewWidth,
        setLastActiveTab,
        setDatabasePath,
    };
});
