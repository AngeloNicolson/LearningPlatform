import dotenv from 'dotenv';
import runMigrations from './database/init';

dotenv.config();

// Initialize database on server start
runMigrations().catch(console.error);

console.log('Backend server initialized');
console.log('Database ready - PostgreSQL');

// Export services for use by API
export { AuthService } from './services/authService';
export { db } from './database';