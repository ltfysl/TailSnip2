import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Component, ComponentCreate, ComponentVersion } from '../types/component';
import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../db';
import { useNotificationStore } from './notifications';

export const useComponentStore = defineStore('components', () => {
    const components = ref<Component[]>([]);
    const activeComponent = ref<Component | null>(null);
    const componentVersions = ref<ComponentVersion[]>([]);
    const notificationStore = useNotificationStore();

    const fetchComponents = async () => {
        try {
            const result = await dbManager.executeSelect('SELECT * FROM components ORDER BY updated_at DESC');
            components.value = result.map((row: any) => ({
                ...row,
                tags: JSON.parse(row.tags || '[]'),
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            }));
        } catch (error) {
            console.error('Error fetching components:', error);
            throw error;
        }
    };

    const fetchComponentVersions = async (componentId: string) => {
        try {
            const result = await dbManager.executeSelect(
                'SELECT * FROM component_versions WHERE component_id = ? ORDER BY created_at DESC',
                [componentId]
            );
            componentVersions.value = result.map((row: any) => ({
                id: row.id,
                componentId: row.component_id,
                code: row.code,
                createdAt: new Date(row.created_at),
            }));
        } catch (error) {
            console.error('Error fetching component versions:', error);
            throw error;
        }
    };

    const createComponent = async (data: ComponentCreate) => {
        const id = uuidv4();
        const now = new Date().toISOString();

        try {
            await dbManager.executeQuery(
                `INSERT INTO components (id, name, description, code, category, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, data.name, data.description, data.code, data.category, JSON.stringify(data.tags), now, now]
            );

            await createVersion(id, data.code);
            await fetchComponents();
        } catch (error) {
            console.error('Error creating component:', error);
            throw error;
        }
    };

    const createVersion = async (componentId: string, code: string) => {
        const id = uuidv4();
        const now = new Date().toISOString();

        try {
            await dbManager.executeQuery(
                `INSERT INTO component_versions (id, component_id, code, created_at)
         VALUES (?, ?, ?, ?)`,
                [id, componentId, code, now]
            );
            notificationStore.addNotification('Version saved successfully');
            await fetchComponentVersions(componentId);
        } catch (error) {
            console.error('Error creating version:', error);
            notificationStore.addNotification('Failed to save version', 'error');
            throw error;
        }
    };

    const updateComponent = async (id: string, data: Partial<ComponentCreate>, showNotification = false) => {
        const now = new Date().toISOString();
        const updates: string[] = [];
        const values: any[] = [];

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(key === 'tags' ? JSON.stringify(value) : value);
            }
        });

        if (updates.length > 0) {
            try {
                updates.push('updated_at = ?');
                values.push(now);
                values.push(id);

                await dbManager.executeQuery(
                    `UPDATE components SET ${updates.join(', ')} WHERE id = ?`,
                    values
                );

                await fetchComponents();
                if (showNotification) {
                    notificationStore.addNotification('Component saved successfully');
                }
            } catch (error) {
                console.error('Error updating component:', error);
                if (showNotification) {
                    notificationStore.addNotification('Failed to update component', 'error');
                }
                throw error;
            }
        }
    };

    const deleteComponent = async (id: string) => {
        try {
            await dbManager.executeQuery('DELETE FROM components WHERE id = ?', [id]);
            await fetchComponents();
            notificationStore.addNotification('Component deleted successfully');
        } catch (error) {
            console.error('Error deleting component:', error);
            notificationStore.addNotification('Failed to delete component', 'error');
            throw error;
        }
    };

    const setActiveComponent = async (component: Component | null) => {
        activeComponent.value = component;
        if (component) {
            await fetchComponentVersions(component.id);
        } else {
            componentVersions.value = [];
        }
    };

    const duplicateComponent = async (component: Component) => {
        try {
            await createComponent({
                name: `${component.name} (Copy)`,
                description: component.description,
                code: component.code,
                category: component.category,
                tags: [...component.tags],
            });
            notificationStore.addNotification('Component duplicated successfully');
        } catch (error) {
            notificationStore.addNotification('Failed to duplicate component', 'error');
            throw error;
        }
    };

    const restoreVersion = async (versionId: string) => {
        try {
            const version = (await dbManager.executeSelect(
                'SELECT * FROM component_versions WHERE id = ?',
                [versionId]
            ))[0];

            if (version && activeComponent.value) {
                await updateComponent(activeComponent.value.id, { code: version.code }, true);
                notificationStore.addNotification('Version restored successfully');
            }
        } catch (error) {
            console.error('Error restoring version:', error);
            notificationStore.addNotification('Failed to restore version', 'error');
            throw error;
        }
    };

    return {
        components,
        activeComponent,
        componentVersions,
        fetchComponents,
        createComponent,
        createVersion,
        updateComponent,
        deleteComponent,
        setActiveComponent,
        duplicateComponent,
        restoreVersion,
        fetchComponentVersions,
    };
});
