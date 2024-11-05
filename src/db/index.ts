import { ipcRenderer } from 'electron';

class DatabaseManager {
    private static instance: DatabaseManager;

    private constructor() { }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async executeQuery(sql: string, params: any[] = []): Promise<any> {
        try {
            return await ipcRenderer.invoke('db:execute', sql, params);
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    public async executeSelect(sql: string, params: any[] = []): Promise<any[]> {
        try {
            return await ipcRenderer.invoke('db:select', sql, params);
        } catch (error) {
            console.error('Database select error:', error);
            throw error;
        }
    }
}

export const dbManager = DatabaseManager.getInstance();
