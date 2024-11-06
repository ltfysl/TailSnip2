const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const { initialize, enable } = require('@electron/remote/main');
const fs = require('fs');

// Initialize remote module
initialize();

let db = null;
let dbPath = null;
let mainWindow = null;

function getDatabase() {
  if (!db) {
    try {
      dbPath = dbPath || path.join(app.getPath('userData'), 'components.db');
      const dbExists = fs.existsSync(dbPath);

      db = new Database(dbPath);

      // Only create tables if this is a new database
      if (!dbExists) {
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
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
  return db;
}

// Set up IPC handlers
ipcMain.handle('db:execute', async (event, sql, params = []) => {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  return stmt.run(...params);
});

ipcMain.handle('db:select', async (event, sql, params = []) => {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  return stmt.all(...params);
});

// Add handlers for Tailwind CSS file operations
ipcMain.handle('save:tailwindcss', async (event, css) => {
  const cssPath = path.join(app.getPath('userData'), 'tailwind.min.css');
  await fs.promises.writeFile(cssPath, css, 'utf8');
});

ipcMain.handle('load:tailwindcss', async () => {
  const cssPath = path.join(app.getPath('userData'), 'tailwind.min.css');
  try {
    return await fs.promises.readFile(cssPath, 'utf8');
  } catch (error) {
    return null;
  }
});

// Database path handlers
ipcMain.handle('get-database-path', () => {
  return dbPath || path.join(app.getPath('userData'), 'components.db');
});

ipcMain.handle('set-database-path', async (event, newPath) => {
  try {
    // Check if new path exists and is a valid SQLite database
    if (fs.existsSync(newPath)) {
      try {
        // Test if it's a valid SQLite database by attempting to open it
        const testDb = new Database(newPath);

        // Check if it has the required tables
        const tables = testDb
          .prepare(
            `
          SELECT name FROM sqlite_master
          WHERE type='table' AND name IN ('components', 'categories', 'component_versions', 'ui_settings')
        `
          )
          .all();

        testDb.close();

        // If not all required tables exist, throw error
        if (tables.length < 4) {
          throw new Error('Invalid database structure');
        }
      } catch (error) {
        throw new Error('Invalid SQLite database');
      }
    }

    // Close existing database connection
    if (db) {
      db.close();
      db = null;
    }

    // If the new path doesn't exist, copy current database
    if (!fs.existsSync(newPath) && dbPath && fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, newPath);
    }

    dbPath = newPath;

    // Test new database connection
    getDatabase();

    // Save the new path
    await fs.promises.writeFile(
      path.join(app.getPath('userData'), 'db-path.txt'),
      newPath,
      'utf8'
    );

    // Trigger app restart
    app.relaunch();
    app.exit(0);

    return true;
  } catch (error) {
    console.error('Error setting database path:', error);
    throw error;
  }
});

ipcMain.handle('select-database-path', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Database Location',
    defaultPath: path.join(app.getPath('documents')),
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    properties: ['openFile', 'createDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  // Try to load saved database path
  try {
    const savedPath = await fs.promises.readFile(
      path.join(app.getPath('userData'), 'db-path.txt'),
      'utf8'
    );
    if (savedPath && fs.existsSync(savedPath)) {
      dbPath = savedPath;
    }
  } catch (error) {
    // Use default path if no saved path exists
    console.log('No saved database path found, using default');
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  enable(mainWindow.webContents);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
