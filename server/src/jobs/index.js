import cron                  from 'node-cron';
import { bookingsPaymentExpiry } from './jobs/bookingsPaymentExpiry.js';
import { config }            from '../config/env.js';

export const startJobs = () => {
  if (config.env === 'test') return; // never run in test environment

  // Run every hour
  cron.schedule('0 * * * *', async () => {
    await bookingsPaymentExpiry();
  });

  console.log('[jobs] Scheduled jobs started');
};