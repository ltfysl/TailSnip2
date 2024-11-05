import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    query: (...args) => ipcRenderer.invoke('db:query', ...args),
    execute: (...args) => ipcRenderer.invoke('db:execute', ...args),
    executeMany: (...args) => ipcRenderer.invoke('db:executeMany', ...args),
  },
});
