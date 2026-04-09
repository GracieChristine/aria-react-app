import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing, testWorldId, testRegionId, testCityId } from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                            from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

// ─── Base payload used across POST and PUT validation tests ───────────────────
const basePayload = {
  title:         'Beautiful Apartment',
  description:   'Lovely place',
  address:       '123 Main St',
  worldId:       testWorldId,
  regionId:      testRegionId,
  cityId:        testCityId,
  pricePerNight: 120,
  maxGuests:     3,
  bedrooms:      2,
  bathrooms:     1,
  propertyType:  'cottage'
};

const omit = (obj, key) => {
  const { [key]: _, ...rest } = obj; // eslint-disable-line no-unused-vars
  return rest;
};

describe(`POST /api/listings`, () => {
  let accessToken;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));
  });

  it(`should create listing as host successfully`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(basePayload);

    expect(response.status).toBe(201);
    expect(response.body.listing.title).toBe('Beautiful Apartment');
    expect(response.body.listing.status).toBe('pending');
  });

  it(`should not create a listing as guest`, async () => {
    ({ accessToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    }));

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(basePayload);

    expect(response.status).toBe(403);
  });

  it(`should not create a listing as admin`, async () => {
    ({ accessToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    }));

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(basePayload);

    expect(response.status).toBe(403);
  });

  it(`should not create a listing as super_admin`, async () => {
    ({ accessToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    }));

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(basePayload);

    expect(response.status).toBe(403);
  });

  it(`should reject if create with no title`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, title: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with title exceeding 50 characters`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, title: 'Modern City Center Apartment w/ Fast WiFi & Parking' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no description`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, description: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with description exceeding 500 characters`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, description: 'A'.repeat(501) });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no address`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, address: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with address that does not start with a number`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, address: 'Main St' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with address that does not end with a street suffix`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, address: '123 Main' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no cityId`, async () => {
    const payload = omit(basePayload, 'cityId');
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with invalid cityId`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, cityId: 'not-a-uuid' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with nonexistent cityId`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, cityId: '00000000-0000-4000-8000-000000000099' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no regionId`, async () => {
    const payload = omit(basePayload, 'regionId');
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no worldId`, async () => {
    const payload = omit(basePayload, 'worldId');
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no pricePerNight`, async () => {
    const payload = omit(basePayload, 'pricePerNight');

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with zero pricePerNight`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, pricePerNight: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative pricePerNight`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, pricePerNight: -120 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no maxGuests`, async () => {
    const payload = omit(basePayload, 'maxGuests');

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with zero maxGuests`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, maxGuests: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative maxGuests`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, maxGuests: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no bedrooms`, async () => {
    const payload = omit(basePayload, 'bedrooms');

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative bedrooms`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, bedrooms: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no bathrooms`, async () => {
    const payload = omit(basePayload, 'bathrooms');

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(response.status).toBe(422);
  });

  it(`should reject if create with zero bathrooms`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, bathrooms: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with negative bathrooms`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, bathrooms: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no propertyType`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, propertyType: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with invalid propertyType`, async () => {
    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...basePayload, propertyType: 'notAnOption' });

    expect(response.status).toBe(422);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .post('/api/listings')
      .send(basePayload);

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/listings`, () => {
  it(`should return active listings as host`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

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
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);
    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings');

    expect(response.status).toBe(200);
  });

  it(`should return active listings filtered by city`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);
    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings?city=Test City');

    expect(response.status).toBe(200);
    expect(response.body.listings.every((l) => l.city === 'Test City')).toBe(true);
  });

  it(`should return empty array if city not found`, async () => {
    const { accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { listing } = await createTestListing(accessToken);
    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });

    const response = await api.get('/api/listings?city=NonExistentCity');

    expect(response.status).toBe(200);
    expect(response.body.listings.length).toBe(0);
  });
});

describe(`GET /api/listings/:id`, () => {
  let accessToken;
  let listing;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(accessToken));

    await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });
  });

  it(`should return a specific listing`, async () => {
    const response = await api.get(`/api/listings/${listing.id}`);

    expect(response.status).toBe(200);
    expect(response.body.listing.id).toBe(listing.id);
  });

  it(`should reject if nonexistent listing`, async () => {
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
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if super_admin`, async () => {
    const { accessToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .get('/api/listings/host/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if no auth`, async () => {
    const response = await api.get('/api/listings/host/me');

    expect(response.status).toBe(401);
  });
});

describe(`PUT /api/listings/:id`, () => {
  let accessToken;
  let listing;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(accessToken));
  });

  it(`should update own listing as host with info successfully`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:         'Update Title',
        description:   'Update Description',
        address:       '321 Main St',
        worldId:       testWorldId,
        regionId:      testRegionId,
        cityId:        testCityId,
        pricePerNight: 250,
        maxGuests:     5,
        bedrooms:      3,
        bathrooms:     2,
        propertyType:  'manor'
      });

    expect(response.status).toBe(200);
    expect(response.body.listing.title).toBe('Update Title');
    expect(response.body.listing.description).toBe('Update Description');
    expect(response.body.listing.address).toBe('321 Main St');
    expect(response.body.listing.city).toBe('Test City');
    expect(response.body.listing.world).toBe('Test World');
    expect(response.body.listing.pricePerNight).toBe(250);
    expect(response.body.listing.maxGuests).toBe(5);
    expect(response.body.listing.bedrooms).toBe(3);
    expect(response.body.listing.bathrooms).toBe(2);
    expect(response.body.listing.propertyType).toBe('manor');
  });

  it(`should not update a listing from another host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as guest`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as admin`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as super_admin`, async () => {
    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(403);
  });

  it(`should reject if update with empty title`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with title exceeding 50 characters`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Modern City Center Apartment w/ Fast WiFi & Parking' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with empty description`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with description exceeding 500 characters`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'A'.repeat(501) });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with empty address`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ address: '' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with invalid cityId`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ cityId: 'not-a-uuid' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with address that does not start with a number`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ address: 'Main St' });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with zero pricePerNight`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pricePerNight: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative pricePerNight`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pricePerNight: -120 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with zero maxGuests`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maxGuests: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative maxGuests`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maxGuests: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative bedrooms`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bedrooms: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with zero bathrooms`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bathrooms: 0 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with negative bathrooms`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bathrooms: -1 });

    expect(response.status).toBe(422);
  });

  it(`should reject if update with invalid propertyType`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ propertyType: 'notAnOption' });

    expect(response.status).toBe(422);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .put(`/api/listings/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .put(`/api/listings/${listing.id}`)
      .send({ title: 'Update Title' });

    expect(response.status).toBe(401);
  });
});

describe(`PATCH /api/listings/:id/status`, () => {
  let hostToken;
  let listing;

  beforeEach(async () => {
    ({ accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(hostToken));
  });

  it(`should update own listing to active as host successfully`, async () => {
    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('active');
  });

  it(`should update own listing to inactive as host successfully`, async () => {
    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('inactive');
  });

  it(`should not update listing to active from another host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ status: 'active' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to inactive from another host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'host@aria.com',
      role:  'host'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to active from guest`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to inactive from guest`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(403);
  });

  it(`should not update listing to active as admin`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(400);
  });

  it(`should update listing to inactive/terminate as admin`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('inactive');
  });

  it(`should not update listing to active as super_admin`, async () => {
    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(400);
  });

  it(`should update listing to inactive/terminate as super_admin`, async () => {
    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.listing.status).toBe('inactive');
  });

  it(`should reject if no status field`, async () => {
    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(422);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .patch('/api/listings/00000000-0000-0000-0000-000000000000/status')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ status: 'active' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .patch(`/api/listings/${listing.id}/status`)
      .send({ status: 'active' });

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/listings/:id`, () => {
  let hostToken;
  let listing;

  beforeEach(async () => {
    ({ accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(hostToken));
  });

  it(`should delete own listing as host successfully`, async () => {
    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
  });

  it(`should not delete a listing from another host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should not delete a listing as guest`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'guest'
    });

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(403);
  });

  it(`should not delete a listing as admin`, async () => {
    const { accessToken: adminToken } = await registerUser({
      email: 'admin@aria.com',
      role:  'admin'
    });

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(403);
  });

  it(`should not delete a listing as super_admin`, async () => {
    const { accessToken: superAdminToken } = await registerUser({
      email: 'superadmin@aria.com',
      role:  'super_admin'
    });

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .delete(`/api/listings/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .delete(`/api/listings/${listing.id}`);

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/listings/:id/images`, () => {
  let accessToken;
  let listing;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(accessToken));
  });

  it(`should return images for a listing`, async () => {
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
  let accessToken;
  let listing;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(accessToken));
  });

  it(`should add image to own listing as host`, async () => {
    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(201);
    expect(response.body.image.url).toBe('https://example.com/image.jpg');
  });

  it(`should reject if no url`, async () => {
    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(422);
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .post('/api/listings/00000000-0000-0000-0000-000000000000/images')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .post(`/api/listings/${listing.id}/images`)
      .send({ url: 'https://example.com/image.jpg' });

    expect(response.status).toBe(401);
  });
});

describe(`DELETE /api/listings/:id/images/:imageId`, () => {
  let accessToken;
  let listing;
  let imageId;

  beforeEach(async () => {
    ({ accessToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    }));

    ({ listing } = await createTestListing(accessToken));

    const imageRes = await api
      .post(`/api/listings/${listing.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ url: 'https://example.com/image.jpg' });

    imageId = imageRes.body.image.id;
  });

  it(`should remove image from own listing as host`, async () => {
    const response = await api
      .delete(`/api/listings/${listing.id}/images/${imageId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Image deleted successfully');
  });

  it(`should reject if not the listing's host`, async () => {
    const { accessToken: host2Token } = await registerUser({
      email: 'JohnDoe@aria.com',
      role:  'host'
    });

    const response = await api
      .delete(`/api/listings/${listing.id}/images/${imageId}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should reject if nonexistent listing`, async () => {
    const response = await api
      .delete('/api/listings/00000000-0000-0000-0000-000000000000/images/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if nonexistent image`, async () => {
    const response = await api
      .delete(`/api/listings/${listing.id}/images/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const response = await api
      .delete(`/api/listings/${listing.id}/images/${imageId}`);

    expect(response.status).toBe(401);
  });
});