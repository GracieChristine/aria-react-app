import { describe, it, expect, beforeAll, afterEach, afterAll }                                               from '@jest/globals';
import { api, registerUser, createTestListing, createTestBooking, completeBooking, expireBooking }             from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                                                               from './setup.js';
import pool                                                                                                    from '../db/pool.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/reviews`, () => {
  it(`should create a review as guest after completed booking successfully`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const response = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    expect(response.status).toBe(201);
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.comment).toBe('This is just a test review message.');
  });

  it(`should reject if booking is not completed`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);

    const response = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if review window has expired (14 days)`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await expireBooking(booking.id);

    const response = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if already reviewed this booking`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    expect(response.status).toBe(409);
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

    const { booking } = await createTestBooking(guest1Token, listing.id);
    await completeBooking(booking.id);

    const response = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent booking`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: '00000000-0000-0000-0000-000000000000',
        rating:    5,
        comment:   'This is just a test review message.'
      });

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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .get(`/api/reviews/listing/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should not return flagged or removed reviews`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .get(`/api/reviews/listing/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(0);
  });

  it(`should return empty array if no reviews`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .get(`/api/reviews/listing/${listing.id}`);

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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .get('/api/reviews/me')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .get('/api/reviews/me')
    
    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/reviews/:id/flag`, () => {
  it(`should flag a review as the listing's host successfully`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .patch(`/api/reviews/${reviewRes.body.review.id}/flag`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(200);
    expect(response.body.review.status).toBe('flagged');
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'host2@aria.com',
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .patch(`/api/reviews/${reviewRes.body.review.id}/flag`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(403);
  });

  it(`should reject if review is already flagged`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await api
      .patch(`/api/reviews/${reviewRes.body.review.id}/flag`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    const response = await api
      .patch(`/api/reviews/${reviewRes.body.review.id}/flag`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(400);
  });

  it(`should reject if nonexistent review`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .patch('/api/reviews/00000000-0000-0000-0000-000000000000/flag')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ reason: 'This review is inappropriate.' });

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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .patch(`/api/reviews/${reviewRes.body.review.id}/flag`)
      .send({ reason: 'This review is inappropriate.' });

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/reviews/flagged`, () => {
  it(`should return all flagged reviews as admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .get('/api/reviews/flagged')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should return all flagged reviews as super_admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .get('/api/reviews/flagged')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(1);
  });

  it(`should reject if not admin or super_admin`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .get('/api/reviews/flagged')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(403);
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

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .get('/api/reviews/flagged')

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/reviews/:id`, () => {
  it(`should remove a flagged review as admin successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .delete(`/api/reviews/${reviewRes.body.review.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it(`should remove a flagged review as super_admin successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .delete(`/api/reviews/${reviewRes.body.review.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
  });

  it(`should reject if review is not flagged`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    const response = await api
      .delete(`/api/reviews/${reviewRes.body.review.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if not admin or super_admin`, async () => {
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .delete(`/api/reviews/${reviewRes.body.review.id}`)
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

    const { booking } = await createTestBooking(guestToken, listing.id);
    await completeBooking(booking.id);

    const reviewRes = await api
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: booking.id,
        rating:    5,
        comment:   'This is just a test review message.'
      });

    await pool.query(
      `UPDATE reviews SET status = 'flagged' WHERE id = $1`,
      [reviewRes.body.review.id]
    );

    const response = await api
      .delete(`/api/reviews/${reviewRes.body.review.id}`);

    expect(response.status).toBe(401);
  });
});