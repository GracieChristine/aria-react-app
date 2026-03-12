import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser }                                                 from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

// ─────────────────────────────────────────────
// GET /api/users/me
// ─────────────────────────────────────────────
describe('GET /api/users/me', () => {
  let accessToken;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({ email: 'jane@aria.com' }));
  });

  it('should return the current user profile', async () => {
    const res = await api
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      email:     'jane@aria.com',
      firstName: 'Jane',
      lastName:  'Doe',
      role:      'guest',
    });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('should reject if no auth', async () => {
    const res = await api.get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('should reject if invalid token', async () => {
    const res = await api
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// PATCH /api/users/me
// ─────────────────────────────────────────────
describe('PATCH /api/users/me', () => {
  let accessToken;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({ email: 'jane@aria.com' }));
  });

  it('should update first name', async () => {
    const res = await api
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Janet' });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Janet');
  });

  it('should update last name', async () => {
    const res = await api
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lastName: 'Smith' });

    expect(res.status).toBe(200);
    expect(res.body.user.lastName).toBe('Smith');
  });

  it('should update email', async () => {
    const res = await api
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'newemail@aria.com' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('newemail@aria.com');
  });

  it('should return 409 if email is already in use', async () => {
    await registerUser({ email: 'other@aria.com' });

    const res = await api
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'other@aria.com' });

    expect(res.status).toBe(409);
  });

  it('should return 400 if no fields provided', async () => {
    const res = await api
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should reject if no auth', async () => {
    const res = await api
      .patch('/api/users/me')
      .send({ firstName: 'Janet' });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// PATCH /api/users/me/password
// ─────────────────────────────────────────────
describe('PATCH /api/users/me/password', () => {
  let accessToken;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({ email: 'jane@aria.com', password: 'OldPassword1!' }));
  });

  it('should change password successfully', async () => {
    const res = await api
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'OldPassword1!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password updated successfully');
  });

  it('should allow login with new password after change', async () => {
    await api
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'OldPassword1!', newPassword: 'NewPassword1!' });

    const login = await api
      .post('/api/auth/login')
      .send({ email: 'jane@aria.com', password: 'NewPassword1!' });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();
  });

  it('should reject if current password is incorrect', async () => {
    const res = await api
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'WrongPassword!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(401);
  });

  it('should reject if new password is too short', async () => {
    const res = await api
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'OldPassword1!', newPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('should reject if fields are missing', async () => {
    const res = await api
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'OldPassword1!' });

    expect(res.status).toBe(400);
  });

  it('should reject if no auth', async () => {
    const res = await api
      .patch('/api/users/me/password')
      .send({ currentPassword: 'OldPassword1!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(401);
  });
});
