import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tutoring_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'development',
});

async function runMigrations() {
  console.log('🚀 Starting database initialization...');

  try {
    // Check if database is already initialized
    const tableCheckResult = await pool.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'tutors', 'bookings')
    `);
    
    const tableCount = parseInt(tableCheckResult.rows[0].count);
    
    if (tableCount > 0) {
      console.log('✅ Database already initialized, skipping migrations');
      return;
    }

    // Create migrations directory path
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Read all SQL files in order
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`\n📝 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        console.log(`✅ Successfully executed: ${file}`);
      } catch (error: any) {
        console.error(`❌ Error executing ${file}:`, error.message);
        
        // If it's a duplicate key error on seed data or table already exists, we can continue
        if ((file.includes('seed') && error.code === '23505') || error.code === '42P07') {
          console.log('⚠️  Data already exists, continuing...');
          continue;
        }
        
        throw error;
      }
    }

    console.log('\n✨ Database initialization completed successfully!');
    
    // Show some sample credentials
    console.log('\n📚 Sample accounts created:');
    console.log('Owner: owner@tutorplatform.com / password123');
    console.log('Admin: admin@tutorplatform.com / password123');
    console.log('Tutor: sarah.chen@tutors.com / password123');
    console.log('Parent: john.parent@email.com / password123');
    console.log('Student: alex.student@email.com / password123');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;