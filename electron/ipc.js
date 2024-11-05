import { ipcMain } from 'electron';
import { getDatabase } from './database.js';

export function setupIpcHandlers() {
  ipcMain.handle('db:init', async (event, schema) => {
    const db = getDatabase();
    return db.exec(schema);
  });

  ipcMain.handle('db:execute', async (event, sql, params) => {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  });

  ipcMain.handle('db:select', async (event, sql, params) => {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  });

  ipcMain.handle('db:executeMany', async (event, queries) => {
    const db = getDatabase();
    const results = [];

    db.transaction(() => {
      for (const query of queries) {
        const stmt = db.prepare(query.sql);
        results.push(stmt.run(...query.params));
      }
    })();

    return results;
  });
}
