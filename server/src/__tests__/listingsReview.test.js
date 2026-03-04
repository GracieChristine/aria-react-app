import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing, createTestBooking,
         completeBooking, expireBooking }                                   from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';
import pool                                                                 from '../db/pool.js';

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

const setupCompletedBooking = async () => {
  const { hostToken, guestToken, listing } = await setupActiveListing();
  const { booking } = await createTestBooking(guestToken, listing.id);
  await completeBooking(booking.id);
  return { hostToken, guestToken, listing, booking };
};

const postReview = (guestToken, bookingId) =>
  api
    .post('/api/reviews')
    .set('Authorization', `Bearer ${guestToken}`)
    .send({
      bookingId,
      rating:  5,
      comment: 'This is just a test review message.'
    });

// ─────────────────────────────────────────────────────────────────────────────

describe(`POST /api/reviews`, () => {
  it(`should create a review as guest after completed booking successfully`, async () => {
    const { guestToken, booking } = await setupCompletedBooking();

    const response = await postReview(guestToken, booking.id);

    expect(response.status).toBe(201);
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.comment).toBe('This is just a test review message.');
  });

  it(`should reject if booking is not completed`, async () => {
    const { guestToken, listing } = await setupActiveListing();
    const { booking } = await createTestBooking(guestToken, listing.id);

    const response = await postReview(guestToken, booking.id);

    expect(response.status).toBe(400);
  });

  it(`should reject if review window has expired (14 days)`, async () => {
    const { guestToken, listing } = await setupActiveListing();
    const { booking } = await createTestBooking(guestToken, listing.id);
    await expireBooking(booking.id);

    const response = await postReview(guestToken, booking.id);

    expect(response.status).toBe(400);
  });

  it(`should reject if already reviewed this booking`, async () => {
    const { guestToken, booking } = await setupCompletedBooking();

    await postReview(guestToken, booking.id);
    const response = await postReview(guestToken, booking.id);

    expect(response.status).toBe(409);
  });

  it(`should reject if not the booking's guest`, async () => {
    const { booking } = await setupCompletedBooking();

    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const response = await postReview(guest2Token, booking.id);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent booking`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await postReview(guestToken, '00000000-0000-0000-0000-000000000000');

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { booking } = await setupCompletedBooking();

    const response = await api
      .post('/api/reviews')
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/reviews/listing/:id`, () => {
  it(`should return active reviews for a listing`, async () => {
    const { guestToken, listing, booking } = await setupCompletedBooking();
    await postReview(guestToken, booking.id);

    const response = await api.get(`/api/reviews/listing/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should not return flagged or removed reviews`, async () => {
    const { guestToken, listing, booking } = await setupCompletedBooking();
    const reviewRes = await postReview(guestToken, booking.id);

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api.get(`/api/reviews/listing/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(0);
  });

  it(`should return empty array if no reviews`, async () => {
    const { listing } = await setupActiveListing();

    const response = await api.get(`/api/reviews/listing/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(0);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .get('/api/reviews/listing/00000000-0000-0000-0000-000000000000');

    expect(response.status).toBe(404);
  });
});

describe(`GET /api/reviews/me`, () => {
  it(`should return own reviews as guest`, async () => {
    const { guestToken, booking } = await setupCompletedBooking();
    await postReview(guestToken, booking.id);

    const response = await api
      .get('/api/reviews/me')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should reject if no auth`, async () => {
    const response = await api.get('/api/reviews/me');

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/reviews/:id/flag`, () => {
  let hostToken;
  let guestToken;
  let reviewId;

  beforeEach(async () => {
    let booking;
    ({ hostToken, guestToken, booking } = await setupCompletedBooking());

    const reviewRes = await postReview(guestToken, booking.id);
    reviewId = reviewRes.body.review.id;
  });

  it(`should flag a review as the listing's host successfully`, async () => {
    const response = await api
      .patch(`/api/reviews/${reviewId}/flag`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(200);
    expect(response.body.review.status).toBe('flagged');
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'host2@aria.com',
      role:  'host'
    });

    const response = await api
      .patch(`/api/reviews/${reviewId}/flag`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(403);
  });

  it(`should reject if review is already flagged`, async () => {
    await api
      .patch(`/api/reviews/${reviewId}/flag`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    const response = await api
      .patch(`/api/reviews/${reviewId}/flag`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent review`, async () => {
    const response = await api
      .patch('/api/reviews/00000000-0000-0000-0000-000000000000/flag')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .patch(`/api/reviews/${reviewId}/flag`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/reviews/flagged`, () => {
  let flaggedReviewId;

  beforeEach(async () => {
    const { guestToken, booking } = await setupCompletedBooking();
    const reviewRes = await postReview(guestToken, booking.id);
    flaggedReviewId = reviewRes.body.review.id;

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [flaggedReviewId]
    );
  });

  it(`should return all flagged reviews as admin`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .get('/api/reviews/flagged')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should return all flagged reviews as super_admin`, async () => {
    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .get('/api/reviews/flagged')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should reject if not admin or super_admin`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const response = await api
      .get('/api/reviews/flagged')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if no auth`, async () => {
    const response = await api.get('/api/reviews/flagged');

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/reviews/:id`, () => {
  let flaggedReviewId;
  let hostToken;

  beforeEach(async () => {
    let guestToken, booking;
    ({ hostToken, guestToken, booking } = await setupCompletedBooking());

    const reviewRes = await postReview(guestToken, booking.id);
    flaggedReviewId = reviewRes.body.review.id;

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [flaggedReviewId]
    );
  });

  it(`should remove a flagged review as admin successfully`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .delete(`/api/reviews/${flaggedReviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it(`should remove a flagged review as super_admin successfully`, async () => {
    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .delete(`/api/reviews/${flaggedReviewId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
  });

  it(`should reject if review is not flagged`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    // create a fresh unflagged review using different emails to avoid conflicts
    const { accessToken: host2Token } = await registerUser({
      email: 'host2@aria.com',
      role:  'host'
    });
    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });
    const { listing: listing2 } = await createTestListing(host2Token);
    await api
      .patch(`/api/listings/${listing2.id}/status`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ status: 'active' });
    const { booking: booking2 } = await createTestBooking(guest2Token, listing2.id);
    await completeBooking(booking2.id);
    const reviewRes2 = await postReview(guest2Token, booking2.id);

    const response = await api
      .delete(`/api/reviews/${reviewRes2.body.review.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if not admin or super_admin`, async () => {
    const response = await api
      .delete(`/api/reviews/${flaggedReviewId}`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent review`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .delete('/api/reviews/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .delete(`/api/reviews/${flaggedReviewId}`);

    expect(response.status).toBe(401);
  });
});