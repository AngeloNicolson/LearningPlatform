import { query } from './connection';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Run migration to add subject columns
    console.log('Adding subject and grade_level columns...');
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', '001_add_subject_columns.sql'),
      'utf8'
    );
    
    // Split by semicolon and run each statement separately
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
      }
    }
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();