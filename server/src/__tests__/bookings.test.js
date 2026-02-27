import { describe, it, expect, beforeAll, afterEach, afterAll }  from '@jest/globals';
import { api, registerUser, createTestListing }                  from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                 from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/bookings`, () => {
  it(`should book an active listing as guest successfully`, async () => {
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

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(201);
    expect(response.body.booking.totalPrice).toBe(400);
    expect(response.body.booking.status).toBe('pending');
    expect(response.body.booking.paymentStatus).toBe('unpaid');
  });

  it(`should reject if host tries to book their own listing`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const response = await api
      .post('/api/bookings')
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(401);
  });

  it(`should reject if booking a pending listing`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if booking an inactive listing`, async () => {
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
      .send({ status: 'inactive' });

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: '00000000-0000-0000-0000-000000000000',
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(404);
  });

  it(`should reject if past dates`, async () => {
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

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2025-06-01',
        checkOut:  '2025-06-05',
        numGuests: 1
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if conflicting dates`, async () => {
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

    await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-03',
        checkOut:  '2026-06-07',
        numGuests: 1
      });

    expect(response.status).toBe(409);
  });

  it(`should reject if exceeding max guests`, async () => {
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

    const response = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 10
      });

    expect(response.status).toBe(400);
  });
});

describe(`GET /api/bookings/me`, () => {
  it(`should return own bookings as guest`, async () => {
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

    await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const response = await api
      .get('/api/bookings/me')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.bookings.length).toBe(1);
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

    await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const response = await api
      .get('/api/bookings/me');
    
    expect(response.status).toBe(401);
  });
});

describe(`GET /api/bookings/listing/:id`, () => {
  it(`should return bookings for own listing as host`, async () => {
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

    await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const response = await api
      .get(`/api/bookings/listing/${listing.id}`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.bookings.length).toBe(1);
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
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

    await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const response = await api
      .get(`/api/bookings/listing/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .get(`/api/bookings/listing/${listing.id}`);

    expect(response.status).toBe(401);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .get('/api/bookings/listing/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });
});

describe(`PATCH /api/bookings/:id`, () => {
  it(`should update dates as guest if booking is pending`, async () => {
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

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(200);
    expect(response.body.booking.totalPrice).toBe(400);
    expect(response.body.booking.status).toBe('pending');
  });

  it(`should update guest count as guest if booking is pending`, async () => {
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

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        numGuests: 2
      });

    expect(response.status).toBe(200);
    expect(response.body.booking.numGuests).toBe(2);
    expect(response.body.booking.status).toBe('pending');
  });

  it(`should reject if booking is not pending (confirmed)`, async () => {
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
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if booking is not pending (cancelled)`, async () => {
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
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if booking has a failed payment`, async () => {
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
      .set('x-payment-result', 'fail');

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if update with past dates`, async () => {
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

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        checkIn:  '2025-07-01',
        checkOut: '2025-07-05'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if update with conflicting dates`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guest1Token } = await registerUser({
      email: 'guest1@aria.com',
      role:  'guest'
    });

    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const booking1Res = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guest1Token}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-07-01',
        checkOut:  '2026-07-05',
        numGuests: 1
      });

    const booking1Id = booking1Res.body.booking.id;

    const response = await api
      .patch(`/api/bookings/${booking1Id}`)
      .set('Authorization', `Bearer ${guest1Token}`)
      .send({
        checkIn:  '2026-07-03',
        checkOut: '2026-07-07'
      });

    expect(response.status).toBe(409);
  });

  it(`should reject if update with exceeding guest count`, async () => {
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

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        numGuests: 20
      });

    expect(response.status).toBe(400);
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

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(401);
  });

  it(`should reject if nonexistent booking`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(404);
  });

  it(`should reject if not the booking's guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guest1Token } = await registerUser({
      email: 'guest1@aria.com',
      role:  'guest'
    });

    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guest1Token}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({
        checkIn:  '2026-07-01',
        checkOut: '2026-07-05'
      });

    expect(response.status).toBe(403);
  });
});

describe(`PATCH /api/bookings/:id/cancel`, () => {
  it(`should cancel a pending booking as guest successfully`, async () => {
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

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
  });

  it(`should request cancel for a confirmed booking as guest successfully`, async () => {
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
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancellation_requested');
  });

  it(`should cancel a pending booking as host successfully`, async () => {
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

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
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

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`);

    expect(response.status).toBe(401);
  });

  it(`should reject if already cancelled`, async () => {
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
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if not guest or host of the booking`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guest1Token } = await registerUser({
      email: 'guest1@aria.com',
      role:  'guest'
    });

    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const bookingRes = await api
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guest1Token}`)
      .send({
        listingId: listing.id,
        checkIn:   '2026-06-01',
        checkOut:  '2026-06-05',
        numGuests: 1
      });

    const bookingId = bookingRes.body.booking.id;

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guest2Token}`);

    expect(response.status).toBe(403);
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

    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000/cancel')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(404);
  });
});