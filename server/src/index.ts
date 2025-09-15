import dotenv from 'dotenv';
import { initDatabase } from './database/init';
import DatabaseConnection from './database';

dotenv.config();

// Initialize database on server start
initDatabase();

console.log('Backend server initialized');
console.log('Database ready at:', process.env.DATABASE_PATH || './database.db');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  DatabaseConnection.close();
  process.exit(0);
});

// Export services for use by API
export { AuthService } from './services/authService';
export { db } from './database';