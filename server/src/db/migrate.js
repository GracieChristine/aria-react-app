import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, 'migrations');

async function migrate() {
  const client = await pool.connect();

  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        ran_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get already ran migrations
    const { rows: ran } = await client.query(
      'SELECT filename FROM _migrations'
    );
    const ranFiles = ran.map((r) => r.filename);

    // Get all migration files sorted
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (ranFiles.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already ran)`);
        continue;
      }

      const sql = readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');

      console.log(`✅ Ran migration: ${file}`);
    }

    console.log('🎉 All migrations complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();