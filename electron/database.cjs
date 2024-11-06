const Database = require('better-sqlite3');
const { app } = require('electron');
const path = require('path');

let db = null;

function getDatabase() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'components.db');
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        code TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS component_versions (
        id TEXT PRIMARY KEY,
        component_id TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ui_settings (
        id TEXT PRIMARY KEY,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return db;
}

module.exports = {
  getDatabase,
  executeQuery: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.run(...params);
  },
  executeMany: (queries) => {
    const database = getDatabase();
    const results = [];

    database.transaction(() => {
      for (const query of queries) {
        const stmt = database.prepare(query.sql);
        results.push(stmt.run(...query.params));
      }
    })();

    return results;
  },
};
