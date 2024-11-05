import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import { SCHEMA } from './schema';

let db: Database.Database | null = null;

export function getDatabase() {
    if (!db) {
        const dbPath = join(app.getPath('userData'), 'components.db');
        db = new Database(dbPath);
        db.exec(SCHEMA);
    }
    return db;
}

export function executeQuery(sql: string, params: any[] = []) {
    const database = getDatabase();
    try {
        const stmt = database.prepare(sql);
        return stmt.run(...params);
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export function executeMany(queries: { sql: string; params: any[] }[]) {
    const database = getDatabase();
    const results = [];

    try {
        database.transaction(() => {
            for (const query of queries) {
                const stmt = database.prepare(query.sql);
                results.push(stmt.run(...query.params));
            }
        })();
        return results;
    } catch (error) {
        console.error('Database transaction error:', error);
        throw error;
    }
}
