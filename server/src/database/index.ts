import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool for PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tutoring_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'development',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('Server connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', error);
    throw error;
  }
};

// Helper function for transactions
export const getClient = () => {
  return pool.connect();
};

export const db = pool;
export default pool;