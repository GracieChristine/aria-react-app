import pool   from '../db/pool.js';
import bcrypt from 'bcryptjs';
import { readFileSync, readdirSync } from 'fs';
import path   from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const setupTestDB = async () => {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, '../db/migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id       SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        ran_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    const { rows: ran } = await client.query('SELECT filename FROM _migrations');
    const ranFiles = ran.map((r) => r.filename);

    for (const file of files) {
      if (ranFiles.includes(file)) continue;
      const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
    }

    // Seed admin and super_admin users
    const adminHash      = await bcrypt.hash('admin123', 10);
    const superAdminHash = await bcrypt.hash('admin123', 10);

    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES
        ('admin@aria.com',      $1, 'Admin', 'User',  'admin'),
        ('superadmin@aria.com', $2, 'Super', 'Admin', 'super_admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminHash, superAdminHash]);

    // Seed a test location hierarchy (universe → world → region → city)
    await client.query(`
      INSERT INTO universes (id, name, slug)
      VALUES ('00000000-0000-4000-8000-000000000001', 'Test Universe', 'test-universe')
      ON CONFLICT (slug) DO NOTHING
    `);
    await client.query(`
      INSERT INTO worlds (id, universe_id, name)
      VALUES ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Test World')
      ON CONFLICT (universe_id, name) DO NOTHING
    `);
    await client.query(`
      INSERT INTO regions (id, world_id, name)
      VALUES ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'Test Region')
      ON CONFLICT (world_id, name) DO NOTHING
    `);
    await client.query(`
      INSERT INTO cities (id, region_id, name)
      VALUES ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', 'Test City')
      ON CONFLICT (region_id, name) DO NOTHING
    `);

  } finally {
    client.release();
  }
};

export const clearTestDB = async () => {
  await pool.query(`
    TRUNCATE messages, conversations, favorites, reviews,
             bookings, listing_amenities, listing_images,
             listings, users RESTART IDENTITY CASCADE
  `);
  // Note: universes/worlds/regions/cities are NOT truncated —
  // the test location hierarchy seeded in setupTestDB persists across tests.

  const adminHash      = await bcrypt.hash('admin123', 10);
  const superAdminHash = await bcrypt.hash('admin123', 10);

  await pool.query(`
    INSERT INTO users (email, password_hash, first_name, last_name, role)
    VALUES
      ('admin@aria.com',      $1, 'Admin', 'User',  'admin'),
      ('superadmin@aria.com', $2, 'Super', 'Admin', 'super_admin')
    ON CONFLICT (email) DO NOTHING
  `, [adminHash, superAdminHash]);
};

export const closeTestDB = async () => {
  await pool.end();
};