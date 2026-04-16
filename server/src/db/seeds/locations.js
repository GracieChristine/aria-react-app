import pool from '../pool.js';
import { seedLocations } from '../../dev/locationService.js';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await seedLocations(client);
    await client.query('COMMIT');
    console.log('✅ Locations seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
