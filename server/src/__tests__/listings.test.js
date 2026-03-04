import { describe, it, expect, beforeAll, afterEach, afterAll }   from '@jest/globals';
import { api, registerUser, createTestListing }                   from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                  from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/listings`, () => {
  it(`should create listing as host successfully`, async() => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(201);
    expect(response.body.listing.title).toBe('Beautiful Apartment');
    expect(response.body.listing.status).toBe('pending');
  });

  it(`should not create a listing as guest`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'guest'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(403);
  });

  it(`should not create a listing as admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'admin'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(403);
  });

  it(`should not create a listing as super_admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(403);
  });

  it(`should reject if create with no title`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         '',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with title exceeding 50 characters`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Modern City Center Apartment w/ Fast WiFi & Parking',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no description`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   '',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with description exceeding 500 characters`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'A'.repeat(501),
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no address`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no city`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          '',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no country`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       '',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no pricePerNight`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with zero pricePerNight`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 0,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative pricePerNight`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: -120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no maxGuests`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with zero maxGuests`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     0,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative maxGuests`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     -1,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no bedrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative bedrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      -1,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no bathrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with zero bathrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     0,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative bathrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     -1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no propertyType`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  ''
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with invalid propertyType`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'notAnOption'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if no auth`, async() => {
    const response = await api
      .post('/api/listings')
      .send({
        title:         'Beautiful Apartment',
        description:   'Lovely place',
        address:       '123 Main St',
        city:          'Denver',
        country:       'USA',
        pricePerNight: 120,
        maxGuests:     3,
        bedrooms:      2,
        bathrooms:     1,
        propertyType:  'apartment'
      });

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/listings`, () => {
  it(`should return active listings as host`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken);

    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings');

    expect(response.status).toBe(200);
    expect(response.body.listings.length).toBeGreaterThan(0);
    expect(response.body.pagination).toBeDefined();
  });

  it(`should return active listings as guest`, async () => {
    const { accessToken: hostToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'guest'
      }
    );

    const { listing } = await createTestListing(hostToken);

    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings');

    expect(response.status).toBe(200);
  });

  it(`should return active listings filtered by city`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken, { city: 'Denver' });
    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings?city=Denver');

    expect(response.status).toBe(200);
    expect(response.body.listings.every((l) => l.city === 'Denver')).toBe(true);
  });

  it(`should return empty array if city not found`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken, { city: 'isNotValid' });
    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings?city=Denver');

    expect(response.status).toBe(200);
    expect(response.body.listings.length).toBe(0);
  });
});

describe(`GET /api/listings/:id`, () => {
  it(`should return a specific listing`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken);

    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get(`/api/listings/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.listing.id).toBe(listing.id);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken);

    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get(`/api/listings/00000000-0000-0000-0000-000000000000`);

    expect(response.status).toBe(404);
  });
});

describe(`GET /api/listings/host/me`, () => {
  it(`should return own listings as host`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    await createTestListing(accessToken);
    await createTestListing(accessToken);

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.listings.length).toBe(2);
  });

  it(`should return empty array if host has no listings`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.listings.length).toBe(0);
  });

  it(`should reject if guest`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'guest'
    });

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'admin'
    });

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if super_admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .get('/api/listings/host/me');

    expect(response.status).toBe(401);
  });
});

describe(`PUT /api/listings/:id`, () => {
  it(`should update own listing as host with info successfully`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Update Title',
        description:   'Update Description',
        address:       '321 Main St',
        city:          'Boulder',
        country:       'America',
        pricePerNight: 250,
        maxGuests:     5,
        bedrooms:      3,
        bathrooms:     2,
        propertyType:  'house'
      });

    expect(response.status).toBe(200);
    expect(response.body.listing.title).toBe('Update Title');
    expect(response.body.listing.description).toBe('Update Description');
    expect(response.body.listing.address).toBe('321 Main St');
    expect(response.body.listing.city).toBe('Boulder');
    expect(response.body.listing.country).toBe('America');
    expect(response.body.listing.pricePerNight).toBe(250);
    expect(response.body.listing.maxGuests).toBe(5);
    expect(response.body.listing.bedrooms).toBe(3);
    expect(response.body.listing.bathrooms).toBe(2);
    expect(response.body.listing.propertyType).toBe('house');
  });

  it(`should not update a listing from another host`, async () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as super_admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: superAdminToken } = await registerUser({
      email: 'super_admin@aria.com',
      role:  'super_admin'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should reject if update with empty title`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with title exceeding 50 characters`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Modern City Center Apartment w/ Fast WiFi & Parking' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with empty description`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with description exceeding 500 characters`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'A'.repeat(501) });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with empty address`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ address: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with empty city`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ city: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with empty country`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ country: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with zero pricePerNight`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pricePerNight: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative pricePerNight`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pricePerNight: -120 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with zero maxGuests`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maxGuests: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative maxGuests`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maxGuests: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative bedrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bedrooms: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with zero bathrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bathrooms: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative bathrooms`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bathrooms: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with invalid propertyType`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ propertyType: 'notAnOption' });

    expect(response.status).toBe(422);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .put(`/api/listings/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/listings/:id/status`, () => {
  it(`should update own listing to active as host successfully`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('active');
  });

  it(`should update own listing to inactive as host successfully`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('inactive');
  });

  it(`should not update listing to active from another host`, async () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ status: 'active' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to inactive from another host`, async  () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to active from guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to inactive from guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to active as admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(400);
  });

  it(`should update listing to inactive/terminate as admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('inactive');
  });

  it(`should not update listing to active as super_admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: superAdminToken } = await registerUser({
      email: 'super_admin@aria.com',
      role:  'super_admin'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(400);
  });

  it(`should update listing to inactive/terminate as super_admin`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: superAdminToken } = await registerUser({
      email: 'super_admin@aria.com',
      role:  'super_admin'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('inactive');
  });

  it(`should reject if no status field`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(422);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .patch('/api/listings/00000000-0000-0000-0000-000000000000/status')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .send({ status: 'active' });

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/listings/:id`, () => {
  it(`should delete own listing as host successfully`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });

  it(`should not delete a listing from another host`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should not delete a listing as guest`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'guest'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should not delete a listing as admin`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'admin'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should not delete a listing as super_admin`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'super_admin'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .delete(`/api/listings/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .delete(`/api/listings/${listing.id}`);

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/listings/:id/images`, () => {
  it(`should return images for a listing`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    const response = await api
      .get(`/api/listings/${listing.id}/images`);

    expect(response.status).toBe(200);
    expect(response.body.images.length).toBe(1);
    expect(response.body.images[0].url).toBe('https://example.com/image.jpg');
  });

  it(`should return empty array if no images`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .get(`/api/listings/${listing.id}/images`);

    expect(response.status).toBe(200);
    expect(response.body.images.length).toBe(0);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .get('/api/listings/00000000-0000-0000-0000-000000000000/images');

    expect(response.status).toBe(404);
  });
});

describe(`POST /api/listings/:id/images`, () => {
  it(`should add image to own listing as host`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(201);
    expect(response.body.image.url).toBe('https://example.com/image.jpg');
  });

  it(`should reject if no url`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(422);
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post('/api/listings/00000000-0000-0000-0000-000000000000/images')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/listings/:id/images/:imageId`, () => {
  it(`should remove image from own listing as host`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const imageRes = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    const imageId = imageRes.body.image.id;

    const response = await api
      .delete(`/api/listings/${listing.id}/images/${imageId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Image deleted successfully');
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host1Token } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(host1Token);

    const imageRes = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${host1Token}`)
      .send({ url: 'https://example.com/image.jpg' });

    const imageId = imageRes.body.image.id;

    const response = await api
      .delete(`/api/listings/${listing.id}/images/${imageId}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .delete('/api/listings/00000000-0000-0000-0000-000000000000/images/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if nonexistent image`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .delete(`/api/listings/${listing.id}/images/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);

    const imageRes = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    const imageId = imageRes.body.image.id;

    const response = await api
      .delete(`/api/listings/${listing.id}/images/${imageId}`);

    expect(response.status).toBe(401);
  });
});