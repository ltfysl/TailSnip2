const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const { initialize, enable } = require('@electron/remote/main');
const fs = require('fs').promises;

// Initialize remote module
initialize();

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
    `);
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
  await fs.writeFile(cssPath, css, 'utf8');
});

ipcMain.handle('load:tailwindcss', async () => {
  const cssPath = path.join(app.getPath('userData'), 'tailwind.min.css');
  try {
    return await fs.readFile(cssPath, 'utf8');
  } catch (error) {
    return null;
  }
});

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
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
