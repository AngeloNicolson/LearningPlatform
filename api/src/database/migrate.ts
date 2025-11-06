/**
 * @file migrate.ts
 * @author Angelo Nicolson
 * @brief Database migration script runner
 * @description Executes all database migration scripts in order. Tracks which migrations have been run
 * to avoid re-running them. Reads SQL migration files from the migrations directory, executes them
 * sequentially, and records their completion in a migrations tracking table.
 */

import { query } from './connection';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function createMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await query('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map(row => row.filename));
}

async function recordMigration(filename: string) {
  await query(
    'INSERT INTO schema_migrations (filename) VALUES ($1)',
    [filename]
  );
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...\n');

    // Create migrations tracking table
    await createMigrationsTable();
    console.log('✓ Migrations tracking table ready\n');

    // Get list of already executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Get all migration files in order
    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order (001, 002, 003, etc.)

    let ranCount = 0;

    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`⊘ Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`→ Running ${file}...`);

      const migrationSQL = readFileSync(
        join(migrationsDir, file),
        'utf8'
      );

      // Split by semicolon and run each statement separately
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        await query(statement);
      }

      // Record that this migration was executed
      await recordMigration(file);
      console.log(`✓ Completed ${file}\n`);
      ranCount++;
    }

    if (ranCount === 0) {
      console.log('✓ All migrations are up to date!');
    } else {
      console.log(`✓ Successfully ran ${ranCount} migration(s)!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();