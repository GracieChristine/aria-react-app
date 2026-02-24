import request from 'supertest';
import app     from '../app.js';
import pool    from '../db/pool.js';
import bcrypt  from 'bcryptjs';

export const api = request(app);

export const registerUser = async (overrides = {}) => {
  const defaults = {
    email:     'JaneDoe@aria.com',
    password:  'password123',
    firstName: 'Jane',
    lastName:  'Doe',
    role:      'guest',
  };

  const merged = { ...defaults, ...overrides };

  // normalize super-admin (hyphen) → super_admin (underscore)
  const normalizedRole = merged.role === 'super-admin' ? 'super_admin' : merged.role;

  if (['host', 'admin', 'super_admin'].includes(normalizedRole)) {

    if (['admin', 'super_admin'].includes(normalizedRole)) {
      // pre-seeded accounts use admin123
      if (merged.email === 'admin@aria.com' || merged.email === 'superadmin@aria.com') {
        const loginRes = await api
          .post('/api/auth/login')
          .send({ email: merged.email, password: 'admin123' });
        return loginRes.body;
      }

      // non-pre-seeded admin — insert directly then login
      const hash = await bcrypt.hash(merged.password, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [merged.email.toLowerCase(), hash, merged.firstName, merged.lastName, normalizedRole]
      );
      const loginRes = await api
        .post('/api/auth/login')
        .send({ email: merged.email, password: merged.password });
      return loginRes.body;
    }

    // host — insert directly then login
    const hash = await bcrypt.hash(merged.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [merged.email.toLowerCase(), hash, merged.firstName, merged.lastName, normalizedRole]
    );
    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: merged.email, password: merged.password });
    return loginRes.body;
  }

  // guest — use registration endpoint
  const res = await api
    .post('/api/auth/register')
    .send(merged);
  return res.body;
};

export const loginUser = async (email = 'test@aria.com', password = 'password123') => {
  const res = await api
    .post('/api/auth/login')
    .send({ email, password });
  return res.body;
};

export const createTestListing = async (token, overrides = {}) => {
  const defaults = {
    title:         'Test Listing',
    description:   'A lovely test listing',
    address:       '123 Test St',
    city:          'Denver',
    country:       'USA',
    pricePerNight: 100,
    maxGuests:     2,
    bedrooms:      1,
    bathrooms:     1,
    propertyType:  'apartment',
  };
  const res = await api
    .post('/api/listings')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...defaults, ...overrides });
  return res.body;
};

export const createTestBooking = async (guestToken, listingId, overrides = {}) => {
  const defaults = {
    listingId,
    checkIn:   '2026-06-01',
    checkOut:  '2026-06-05',
    numGuests: 1,
  };
  const res = await api
    .post('/api/bookings')
    .set('Authorization', `Bearer ${guestToken}`)
    .send({ ...defaults, ...overrides });
  return res.body;
};

const setBookingUpdatedAt = async (bookingId, daysAgo) => {
  await pool.query(
    `UPDATE bookings 
     SET updated_at = NOW() - INTERVAL '${daysAgo} days'
     WHERE id = $1`,
    [bookingId]
  );
};

export const completeBooking = async (bookingId) => {
  await pool.query(
    `UPDATE bookings
     SET status    = 'completed',
         check_out = NOW() - INTERVAL '2 days'
     WHERE id = $1`,
    [bookingId]
  );
};

export const expireBooking = async (bookingId) => {
  await pool.query(
    `UPDATE bookings
     SET status    = 'completed',
         check_out = NOW() - INTERVAL '15 days'
     WHERE id = $1`,
    [bookingId]
  );
};