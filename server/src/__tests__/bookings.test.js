import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing }                             from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

// ─── Shared setup helpers ─────────────────────────────────────────────────────

const setupActiveListing = async () => {
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

  return { hostToken, guestToken, listing };
};

const createBooking = (guestToken, listingId, overrides = {}) =>
  api
    .post('/api/bookings')
    .set('Authorization', `Bearer ${guestToken}`)
    .send({
      listingId,
      checkIn:   '2026-06-01',
      checkOut:  '2026-06-05',
      numGuests: 1,
      ...overrides
    });

// ─────────────────────────────────────────────────────────────────────────────

describe(`POST /api/bookings`, () => {
  let hostToken;
  let guestToken;
  let listing;

  beforeEach(async () => {
    ({ hostToken, guestToken, listing } = await setupActiveListing());
  });

  it(`should book an active listing as guest successfully`, async () => {
    const response = await createBooking(guestToken, listing.id);

    expect(response.status).toBe(201);
    expect(response.body.booking.totalPrice).toBe(400);
    expect(response.body.booking.status).toBe('pending');
    expect(response.body.booking.paymentStatus).toBe('unpaid');
  });

  it(`should not book own listing as host`, async () => {
    const response = await createBooking(hostToken, listing.id);

    expect(response.status).toBe(400);
  });

  it(`should reject if listing is pending`, async () => {
    const { accessToken: hostToken2 } = await registerUser({
      email: 'host2@aria.com',
      role:  'host'
    });

    const { listing: pendingListing } = await createTestListing(hostToken2);

    const response = await createBooking(guestToken, pendingListing.id);

    expect(response.status).toBe(400);
  });

  it(`should reject if listing is inactive`, async () => {
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'inactive' });

    const response = await createBooking(guestToken, listing.id);

    expect(response.status).toBe(400);
  });

  it(`should reject if check-in date is in the past`, async () => {
    const response = await createBooking(guestToken, listing.id, {
      checkIn:  '2025-06-01',
      checkOut: '2025-06-05'
    });

    expect(response.status).toBe(400);
  });

  it(`should reject if dates conflict with existing booking`, async () => {
    await createBooking(guestToken, listing.id);

    const response = await createBooking(guestToken, listing.id, {
      checkIn:  '2026-06-03',
      checkOut: '2026-06-07'
    });

    expect(response.status).toBe(409);
  });

  it(`should reject if guests exceed listing maximum`, async () => {
    const response = await createBooking(guestToken, listing.id, { numGuests: 10 });

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await createBooking(guestToken, '00000000-0000-0000-0000-000000000000');

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
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
});

describe(`GET /api/bookings/me`, () => {
  let guestToken;

  beforeEach(async () => {
    const { guestToken: gt, listing } = await setupActiveListing();
    guestToken = gt;

    await createBooking(guestToken, listing.id);
  });

  it(`should return own bookings as guest`, async () => {
    const response = await api
      .get('/api/bookings/me')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.bookings.length).toBe(1);
  });

  it(`should reject if no auth`, async () => {
    const response = await api.get('/api/bookings/me');

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/bookings/listing/:id`, () => {
  let hostToken;
  let listing;

  beforeEach(async () => {
    let guestToken;
    ({ hostToken, guestToken, listing } = await setupActiveListing());

    await createBooking(guestToken, listing.id);
  });

  it(`should return bookings for own listing as host`, async () => {
    const response = await api
      .get(`/api/bookings/listing/${listing.id}`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.bookings.length).toBe(1);
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .get(`/api/bookings/listing/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .get('/api/bookings/listing/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .get(`/api/bookings/listing/${listing.id}`);

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/bookings/:id`, () => {
  let guestToken;
  let listing;
  let bookingId;

  beforeEach(async () => {
    const { guestToken: gt, listing: l } = await setupActiveListing();
    guestToken = gt;
    listing    = l;

    const bookingRes = await createBooking(guestToken, listing.id);
    bookingId = bookingRes.body.booking.id;
  });

  it(`should update dates as guest if booking is pending`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(200);
    expect(response.body.booking.totalPrice).toBe(400);
    expect(response.body.booking.status).toBe('pending');
  });

  it(`should update guest count as guest if booking is pending`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ numGuests: 2 });

    expect(response.status).toBe(200);
    expect(response.body.booking.numGuests).toBe(2);
    expect(response.body.booking.status).toBe('pending');
  });

  it(`should not update if booking is confirmed`, async () => {
    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(400);
  });

  it(`should not update if booking is cancelled`, async () => {
    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(400);
  });

  it(`should not update if booking has failed payment`, async () => {
    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'fail');

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(400);
  });

  it(`should reject if updated dates are in the past`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2025-07-01', checkOut: '2025-07-05' });

    expect(response.status).toBe(400);
  });

  it(`should reject if updated dates conflict with existing booking`, async () => {
    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
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

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2026-07-03', checkOut: '2026-07-07' });

    expect(response.status).toBe(409);
  });

  it(`should reject if updated guest count exceeds maximum`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ numGuests: 20 });

    expect(response.status).toBe(400);
  });

  it(`should not update if not the booking's guest`, async () => {
    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent booking`, async () => {
    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}`)
      .send({ checkIn: '2026-07-01', checkOut: '2026-07-05' });

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/bookings/:id/cancel`, () => {
  let hostToken;
  let guestToken;
  let bookingId;

  beforeEach(async () => {
    let listing;
    ({ hostToken, guestToken, listing } = await setupActiveListing());

    const bookingRes = await createBooking(guestToken, listing.id);
    bookingId = bookingRes.body.booking.id;
  });

  it(`should cancel a pending booking as guest successfully`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
  });

  it(`should request cancel for a confirmed booking as guest successfully`, async () => {
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
    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
  });

  it(`should reject if already cancelled`, async () => {
    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(400);
  });

  it(`should not cancel if not guest or host of booking`, async () => {
    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guest2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent booking`, async () => {
    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000/cancel')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    await api
      .post(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('x-payment-result', 'succeed');

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`);

    expect(response.status).toBe(401);
  });
});