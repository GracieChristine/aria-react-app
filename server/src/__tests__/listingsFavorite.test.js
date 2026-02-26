import { describe, it, expect, beforeAll, afterEach, afterAll }  from '@jest/globals';
import { api, registerUser, createTestListing }                  from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                 from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/favorite/:id`, () => {
  it(`should add listing to favorite as a guest successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .post(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(201);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .post(`/api/favorites/${listing.id}`);

    expect(response.status).toBe(401);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const response = await api
      .post('/api/favorites/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(404);
  });
});

describe(`GET /api/favorite`, () => {
  it(`should return own favoriote listing list as guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .get('/api/favorites')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.favorites.length).toBe(1);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .get('/api/favorites');

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/favorite/:id`, () => {
  it(`should remove listing from favorite as a guest successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .delete(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);

    const response2 = await api
      .get('/api/favorites')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response2.body.favorites.length).toBe(0);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .delete(`/api/favorites/${listing.id}`);

    expect(response.status).toBe(401);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email:      'janedoe@aria.com',
      role:       'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email:      'guest@aria.com'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post(`/api/favorites/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    const response = await api
      .delete('/api/favorites/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(404);
  });
});