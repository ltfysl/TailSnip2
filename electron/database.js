import Database from 'better-sqlite3';
import { app } from 'electron';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export function getDatabase() {
  if (!db) {
    const userDataPath = app.getPath('userData');
    const dbPath = join(userDataPath, 'components.db');
    db = new Database(dbPath);
    db.exec(SCHEMA);
  }
  return db;
}

export function executeQuery(sql, params = []) {
  const database = getDatabase();
  try {
    const stmt = database.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export function executeMany(queries) {
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
