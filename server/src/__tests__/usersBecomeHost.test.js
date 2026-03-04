import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll }   from '@jest/globals';
import { api, registerUser }                                                  from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                              from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`PATCH /api/users/me/become-host`, () => {
  let accessToken;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'janedoe@aria.com',
      role:  'guest'
    }));
  });

  it(`should upgrade guest to host successfully`, async () => {
    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe('host');
  });

  it(`should not upgrade if already host`, async () => {
    ({ accessToken } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    }));

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  it(`should not upgrade if admin`, async () => {
    ({ accessToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    }));

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  it(`should not upgrade if super_admin`, async () => {
    ({ accessToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    }));

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  it(`should reject if invalid auth`, async () => {
    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer invalidtoken`);

    expect(response.status).toBe(401);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .patch('/api/users/me/become-host');

    expect(response.status).toBe(401);
  });
});