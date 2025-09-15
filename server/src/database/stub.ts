// Stub implementation for build purposes
// This allows TypeScript to compile without better-sqlite3 being installed

export interface Database {
  prepare(sql: string): any;
  pragma(sql: string): void;
  close(): void;
  exec(sql: string): void;
}

export class StubDatabase implements Database {
  prepare(sql: string): any {
    return {
      run: (...args: any[]) => ({ lastInsertRowid: 1 }),
      get: (...args: any[]) => {
        // Return appropriate stub data for common queries
        if (sql.includes('COUNT(*)')) {
          return { count: 0 };
        }
        return null;
      },
      all: (...args: any[]) => [],
    };
  }
  
  pragma(sql: string): void {
    // Stub
  }
  
  close(): void {
    // Stub
  }
  
  exec(sql: string): void {
    // Stub
  }
}

class DatabaseConnection {
  private static instance: Database;
  
  static getInstance(): Database {
    if (!DatabaseConnection.instance) {
      console.warn('Using stub database for build purposes');
      DatabaseConnection.instance = new StubDatabase();
    }
    return DatabaseConnection.instance;
  }
  
  static close() {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
    }
  }
}

export const db = DatabaseConnection.getInstance();
export default DatabaseConnection;