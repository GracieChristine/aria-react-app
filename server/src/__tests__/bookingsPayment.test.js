import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing, createTestBooking }          from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe('POST /api/bookings/:id/pay', () => {
  let guestToken;
  let booking;

  beforeEach(async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'janedoe@aria.com',
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

  it('should confirm booking on successful payment', async () => {
    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('confirmed');
    expect(response.body.booking.paymentStatus).toBe('paid');
  });

  it('should set payment to failed on failed payment', async () => {
    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'fail');

    expect(response.status).toBe(402);
    expect(response.body.booking).toBeUndefined();
  });

  it('should allow retry after failed payment', async () => {
    await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'fail');

    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('confirmed');
    expect(response.body.booking.paymentStatus).toBe('paid');
  });

  it('should reject if booking is already paid', async () => {
    await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(400);
  });

  it('should reject if booking is cancelled', async () => {
    await api
      .patch(`/api/bookings/${booking.id}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(400);
  });

  it('should not pay if not the booking\'s guest', async () => {
    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('Authorization', `Bearer ${guest2Token}`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(403);
  });

  it('should reject if nonexistent booking', async () => {
    const response = await api
      .post('/api/bookings/00000000-0000-0000-0000-000000000000/pay')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(404);
  });

  it('should reject if no auth', async () => {
    const response = await api
      .post(`/api/bookings/${booking.id}/pay`)
      .set('x-payment-result', 'succeed');

    expect(response.status).toBe(401);
  });
});