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

  // if role is host, insert directly into DB to bypass registration
  if (merged.role === 'host') {
    const hash = await bcrypt.hash(merged.password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, 'host') RETURNING *`,
      [merged.email.toLowerCase(), hash, merged.firstName, merged.lastName]
    );
    
    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: merged.email, password: merged.password });

    return loginRes.body;
  }

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