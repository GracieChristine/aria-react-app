import pool from '../db/pool.js'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

export const setupTestDB = async () => {
  const client = await pool.connect()
  try {
    // Run migrations
    const migrationsDir = path.join(__dirname, '../db/migrations')
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id       SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        ran_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    const { rows: ran } = await client.query('SELECT filename FROM _migrations')
    const ranFiles = ran.map((r) => r.filename)

    for (const file of files) {
      if (ranFiles.includes(file)) continue
      const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
    }
  } finally {
    client.release()
  }
}

export const clearTestDB = async () => {
  await pool.query(`
    TRUNCATE messages, conversations, favorites, reviews,
             bookings, listing_amenities, listing_images,
             listings, users RESTART IDENTITY CASCADE
  `)
}

export const closeTestDB = async () => {
  await pool.end()
}