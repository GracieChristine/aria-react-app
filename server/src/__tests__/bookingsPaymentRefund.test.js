import { describe, it, expect, beforeAll, afterEach, afterAll }  from '@jest/globals';
import { api, registerUser, createTestListing }                  from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                 from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`PATCH /api/bookings/:id/cancel`, () => {
  it(`should cancel a confirmed booking as host with full refund (>14 days)`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });

  it(`should cancel a confirmed booking as host with full refund (7-14 days)`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const checkIn  = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   checkIn,
        checkOut:  checkOut,
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });

  it(`should cancel a confirmed booking as host with full refund (<7 days)`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const checkIn  = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   checkIn,
        checkOut:  checkOut,
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });
});

describe(`PATCH /api/bookings/:id/cancel/approve`, () => {
  it(`should approve cancellation with full refund (>14 days)`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });

  it(`should approve cancellation with partial refund (7-14 days)`, async  () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const checkIn  = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   checkIn,
        checkOut:  checkOut,
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('partial');
    expect(response.body.refund.amount).toBe(200);
  });

  it(`should approve cancellation with no refund (<7 days)`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });
    
    const checkIn  = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   checkIn,
        checkOut:  checkOut,
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('none');
    expect(response.body.refund.amount).toBe(0);
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(host1Token);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${host1Token}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if booking not in cancellation_requested status`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent booking`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000/cancel/approve')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`);

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/bookings/:id/cancel/reject`, () => {
  it(`should reject cancellation and restore booking to confirmed`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('confirmed');
    expect(response.body.booking.paymentStatus).toBe('paid');
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(host1Token);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${host1Token}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if booking not in cancellation_requested status`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent booking`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000/cancel/reject')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`);

    expect(response.status).toBe(401);
  });
});