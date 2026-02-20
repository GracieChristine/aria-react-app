import { config } from './config/env.js';
import app from './app.js';
import pool from './db/pool.js';

const PORT = config.port;

// Test DB connection before starting
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Aria server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${config.env}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
});