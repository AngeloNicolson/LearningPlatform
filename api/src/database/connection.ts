import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_PATH || '/data/database.db';
console.log('API connecting to database at:', dbPath);

const database = new Database(dbPath);
database.pragma('foreign_keys = ON');

export const db: Database.Database = database;