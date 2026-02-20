import request from 'supertest'
import app     from '../app.js'

export const api = request(app)

export const registerUser = async (overrides = {}) => {
  const defaults = {
    email:     'JaneDoe@aria.com',
    password:  'password123',
    firstName: 'Jane',
    lastName:  'Doe',
    role:      'guest',
  }
  const res = await api
    .post('/api/auth/register')
    .send({ ...defaults, ...overrides })
  return res.body
}

export const loginUser = async (email = 'test@aria.com', password = 'password123') => {
  const res = await api
    .post('/api/auth/login')
    .send({ email, password })
  return res.body
}

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
  }
  const res = await api
    .post('/api/listings')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...defaults, ...overrides })
  return res.body
}