import { describe, it, expect, beforeAll, afterEach, afterAll }   from '@jest/globals';
import { api, registerUser }                                      from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                  from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/auth/register`, () => {
  it(`should register a new user successfully`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('janedoe@aria.com');
    expect(response.body.user.role).toBe('guest');
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it(`should reject if no email`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      '',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if invalid email`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'notanemail',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if no password`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   '',
          firstName:  'Jane',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if invalid password`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   '123',
          firstName:  'Jane',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if duplicate email`, async () => {
    await registerUser({ email:'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/already in use/i);
  });

  it(`should reject if no first name`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  '',
          lastName:   'Doe'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if no last name`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  'Jane',
          lastName:   ''
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should default role to guest even if host role requested`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe',
          role:       'host'
        }
      );
    
    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('host');
  });

  it(`should default role to guest even if admin role requested`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe',
          role:       'admin'
        }
      );
    
    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('guest');
  });

  it(`should default role to guest even if super-admin role requested`, async () => {
    const response = await api
      .post('/api/auth/register')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123',
          firstName:  'Jane',
          lastName:   'Doe',
          role:       'super-admin'
        }
      );
    
    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('guest');
  });
});

describe(`POST /api/auth/login`, () => {
  it(`should log in with correct credentials successfully`, async() => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   'password123'
        }
      );
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe('janedoe@aria.com');
  });

  it(`should reject if no email`, async () => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      '',
          password:   'password123'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if nonexistent email`, async () => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      'JohnDoe@aria.com',
          password:   'password123'
        }
      );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if invalid email`, async () => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      'notanemail',
          password:   'password123'
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if no password`, async () => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   ''
        }
      );

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it(`should reject if incorrect password`, async () => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   '123password'
        }
      );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
  
  it(`should reject if invalid password`, async () => {
    await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/login')
      .send(
        {
          email:      'JaneDoe@aria.com',
          password:   '123'
        }
      );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe(`GET /api/auth/me`, () => {
  it(`should return user with valid token`, async () => {
    const { accessToken } = await registerUser({ email: 'JaneDoe@aria.com' });
    
    const response = await api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('janedoe@aria.com');
  });

  it(`should rejects request if no authentication/token`, async () => {
    const response = await api.get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  it(`should rejects request if invalid authentication/token`, async () => {
    const response = await api
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
  });
});

describe(`POST /api/auth/refresh`, () => {
  it(`should return new token with valid refresh token`, async () => {
    const data = await registerUser({ email: 'JaneDoe@aria.com' });
    
    const { refreshToken } = data;

    const response = await api
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it(`should reject if invalid refresh token`, async () => {
    const response = await api
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalidToken' });

    expect(response.status).toBe(401);
  });
});

describe(`POST /api/auth/logout`, () => {
  it(`should logout with valid token successfully`, async () => {
    const { accessToken } = await registerUser({ email: 'JaneDoe@aria.com' });

    const response = await api
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it(`should reject if no token`, async () => {
    const response = await api.post('/api/auth/logout');

    expect(response.status).toBe(401);
  });
});