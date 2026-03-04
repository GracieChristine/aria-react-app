import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing, createTestBooking }          from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';
import { bookingsPaymentExpiry }                                            from '../jobs/bookingsPaymentExpiry.js';
import pool                                                                 from '../db/pool.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

const setBookingUpdatedAt = async (bookingId, daysAgo) => {
  await pool.query(
    `UPDATE bookings SET updated_at = NOW() - INTERVAL '${daysAgo} days' WHERE id = $1`,
    [bookingId]
  );
};

describe(`Bookings Payment Expiry Job`, () => {
  let guestToken;
  let booking;

  beforeEach(async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    ({ accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    }));

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    ({ booking } = await createTestBooking(guestToken, listing.id));
  });

  it(`should not cancel confirmed bookings`, async () => {
    await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await setBookingUpdatedAt(booking.id, 3);

    const expired = await bookingsPaymentExpiry();

    expect(expired.length).toBe(0);
  });

  it(`should cancel if failed payment is older than 2 days`, async () => {
    await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'fail');

    await setBookingUpdatedAt(booking.id, 3);

    const expired = await bookingsPaymentExpiry();

    expect(expired.length).toBe(1);
    expect(expired[0].id).toBe(booking.id);
  });

  it(`should not cancel if failed payment is within 2 days`, async () => {
    await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'fail');

    await setBookingUpdatedAt(booking.id, 1);

    const expired = await bookingsPaymentExpiry();

    expect(expired.length).toBe(0);
  });

  it(`should not cancel already cancelled bookings`, async () => {
    await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'fail');

    await setBookingUpdatedAt(booking.id, 3);

    await api
      .patch(`/api/bookings/${booking.id}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const expired = await bookingsPaymentExpiry();

    expect(expired.length).toBe(0);
  });

  it(`should return empty array if no bookings to expire`, async () => {
    const expired = await bookingsPaymentExpiry();

    expect(expired.length).toBe(0);
  });
});