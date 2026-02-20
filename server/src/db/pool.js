import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

const pool = new Pool(
  config.db.url
    ? { connectionString: config.db.url }
    : {
        host:     config.db.host,
        port:     config.db.port,
        database: config.db.name,
        user:     config.db.user,
        password: config.db.password,
      }
);

pool.on('connect', () => {
  if (config.env === 'development') {
    console.log('📦 Connected to PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
  process.exit(-1);
});

export default pool;