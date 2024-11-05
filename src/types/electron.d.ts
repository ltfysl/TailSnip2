export interface IElectronAPI {
  database: {
    query: (...args: any[]) => Promise<any>;
    execute: (sql: string, params?: any[]) => Promise<any>;
    executeMany: (queries: { sql: string; params: any[] }[]) => Promise<any>;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}