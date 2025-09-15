import Database from 'better-sqlite3';
import { join } from 'path';

export type { Database };

class DatabaseConnection {
  private static instance: Database.Database;
  
  static getInstance(): Database.Database {
    if (!DatabaseConnection.instance) {
      const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database.db');
      console.log('Connecting to database at:', dbPath);
      DatabaseConnection.instance = new Database(dbPath);
      DatabaseConnection.instance.pragma('foreign_keys = ON');
    }
    return DatabaseConnection.instance;
  }
  
  static close() {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
    }
  }
}

export const db: Database.Database = DatabaseConnection.getInstance();
export default DatabaseConnection;