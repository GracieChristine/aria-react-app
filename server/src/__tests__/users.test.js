import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { api, registerUser }                                     from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`PATCH /api/users/me/become-host`, () => {
  it(`should upgrade user to host successfully`, async () => {
    const { accessToken } = await registerUser({
      email: 'janedoe@aria.com',
      role:  'guest',
    });

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe('host');
  });

  it(`should reject if user is already a host`, async  () => {
    const { accessToken } = await registerUser({
      email: 'janedoe@aria.com',
      role:  'host',
    });

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if user is an admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin',
    });

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if user is an super_admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin',
    });

    const response = await api
      .patch('/api/users/me/become-host')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if invalid token`, async () => {
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