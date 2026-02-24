import cron                  from 'node-cron';
import { expireFailedBookings } from './expireBookings.js';
import { config }            from '../config/env.js';

export const startJobs = () => {
  if (config.env === 'test') return; // never run in test environment

  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[jobs] Running expireFailedBookings...');
    await expireFailedBookings();
  });

  console.log('[jobs] Scheduled jobs started');
};