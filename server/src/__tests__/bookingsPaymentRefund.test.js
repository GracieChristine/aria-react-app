import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing }                             from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

const daysFromNow = (n) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const setupConfirmedBooking = async ({
  checkIn,
  checkOut,
  hostEmail  = 'JaneDoe@aria.com',
  guestEmail = 'guest@aria.com'
} = {}) => {
  const { accessToken: hostToken } = await registerUser({
    email: hostEmail,
    role:  'host'
  });

  const { accessToken: guestToken } = await registerUser({
    email: guestEmail,
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
      checkIn:   checkIn  ?? '2026-06-01',
      checkOut:  checkOut ?? '2026-06-05',
      numGuests: 1
    });

  const bookingId = bookingRes.body.booking.id;

  await api
    .post(`/api/bookings/${bookingId}/pay`)
    .set('Authorization', `Bearer ${guestToken}`)
    .set('x-payment-result', 'succeed');

  return { hostToken, guestToken, bookingId };
};

describe(`PATCH /api/bookings/:id/cancel`, () => {
  it(`should cancel with full refund if check-in is more than 14 days away`, async () => {
    const { hostToken, bookingId } = await setupConfirmedBooking();

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });

  it(`should cancel with full refund if check-in is 7-14 days away`, async () => {
    const { hostToken, bookingId } = await setupConfirmedBooking({
      checkIn:  daysFromNow(10),
      checkOut: daysFromNow(14)
    });

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });

  it(`should cancel with full refund if check-in is less than 7 days away`, async () => {
    const { hostToken, bookingId } = await setupConfirmedBooking({
      checkIn:  daysFromNow(3),
      checkOut: daysFromNow(7)
    });

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
  let hostToken;
  let guestToken;
  let bookingId;

  beforeEach(async () => {
    ({ hostToken, guestToken, bookingId } = await setupConfirmedBooking());

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);
  });

  it(`should cancel with full refund if check-in is more than 14 days away`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('full');
    expect(response.body.refund.amount).toBe(400);
  });

  it(`should cancel with partial refund if check-in is 7-14 days away`, async () => {
    const { hostToken: host2Token, guestToken: guest2Token, bookingId: bookingId2 } =
      await setupConfirmedBooking({
        checkIn:    daysFromNow(10),
        checkOut:   daysFromNow(14),
        hostEmail:  'host2@aria.com',
        guestEmail: 'guest2@aria.com'
      });

    await api
      .patch(`/api/bookings/${bookingId2}/cancel`)
      .set('Authorization', `Bearer ${guest2Token}`);

    const response = await api
      .patch(`/api/bookings/${bookingId2}/cancel/approve`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('partial');
    expect(response.body.refund.amount).toBe(200);
  });

  it(`should cancel with no refund if check-in is less than 7 days away`, async () => {
    const { hostToken: host2Token, guestToken: guest2Token, bookingId: bookingId2 } =
      await setupConfirmedBooking({
        checkIn:    daysFromNow(3),
        checkOut:   daysFromNow(7),
        hostEmail:  'host2@aria.com',
        guestEmail: 'guest2@aria.com'
      });

    await api
      .patch(`/api/bookings/${bookingId2}/cancel`)
      .set('Authorization', `Bearer ${guest2Token}`);

    const response = await api
      .patch(`/api/bookings/${bookingId2}/cancel/approve`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('cancelled');
    expect(response.body.booking.paymentStatus).toBe('refunded');
    expect(response.body.refund.type).toBe('none');
    expect(response.body.refund.amount).toBe(0);
  });

  it(`should not approve if not the listing's host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'host2@aria.com',
      role:  'host'
    });

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if booking is not awaiting cancellation`, async () => {
    const { hostToken: host2Token, bookingId: bookingId2 } =
      await setupConfirmedBooking({
        checkIn:    '2026-07-01',
        checkOut:   '2026-07-05',
        hostEmail:  'host2@aria.com',
        guestEmail: 'guest2@aria.com'
      });

    const response = await api
      .patch(`/api/bookings/${bookingId2}/cancel/approve`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent booking`, async () => {
    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000/cancel/approve')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/approve`);

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/bookings/:id/cancel/reject`, () => {
  let hostToken;
  let guestToken;
  let bookingId;

  beforeEach(async () => {
    ({ hostToken, guestToken, bookingId } = await setupConfirmedBooking());

    await api
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`);
  });

  it(`should reject cancellation and restore booking to confirmed`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.booking.status).toBe('confirmed');
    expect(response.body.booking.paymentStatus).toBe('paid');
  });

  it(`should not reject if not the listing's host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'host2@aria.com',
      role:  'host'
    });

    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if booking is not awaiting cancellation`, async () => {
    const { hostToken: host2Token, bookingId: bookingId2 } =
      await setupConfirmedBooking({
        checkIn:    '2026-07-01',
        checkOut:   '2026-07-05',
        hostEmail:  'host2@aria.com',
        guestEmail: 'guest2@aria.com'
      });

    const response = await api
      .patch(`/api/bookings/${bookingId2}/cancel/reject`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent booking`, async () => {
    const response = await api
      .patch('/api/bookings/00000000-0000-0000-0000-000000000000/cancel/reject')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .patch(`/api/bookings/${bookingId}/cancel/reject`);

    expect(response.status).toBe(401);
  });
});