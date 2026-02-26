import { describe, it, expect, beforeAll, afterEach, afterAll }   from '@jest/globals';
import { api, registerUser, createTestListing }                   from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                  from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/listings`, () => {
  it(`should create a listing as host with all info successfully`, async() => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(201);
    expect(response.body.listing.title).toBe('Beautiful Apartment');
    expect(response.body.listing.status).toBe('pending');
  });

  it(`should not create a listing as guest`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'guest'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(403);
  });

  // it(`should not create a listing as admin`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'admin'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(403);
  // });

  // it(`should not create a listing as super-admin`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'super-admin'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(403);
  // });

  it(`should reject if create with no title`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           '',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no description`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     '',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no address`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no city`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            '',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no country`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         '',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no pricePerNight`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        // pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no maxGuests`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        // maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no bedrooms`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        // bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no bathrooms`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        // bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(422);
  });

  it(`should reject if create with no propertyType`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        // 
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    ''
      });

    expect(response.status).toBe(422);
  });

  // it(`should reject if update with invalid title exceeding 50 characater limit`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       // cannot excced 50 characters
  //       title:           'Modern City Center Apartment w/ Fast WiFi & Parking',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid title containing special characters`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       // cannot contain special characters except basic punctuation
  //       title:           '☀️Sunny Beach Apt: 2min to Ocean!',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid description exceeding 150 character limit`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       // cannot excced 150 characters
  //       description:     'charming, renovated 2-bedroom cottage nestled in the heart of downtown, offering modern amenities with cozy rustic charm.',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with nonexisting address`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Fake St',
  //       city:            'None',
  //       country:         'World',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with zero pricePerNight`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   0,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with negative pricePerNight`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   -120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with zero maxGuests`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       0,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with negative maxGuests`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       -1,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with zero bedrooms`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        0,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with negative bedrooms`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        -1,
  //       bathrooms:       1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with zero bathrooms`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       0,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with negative bathrooms`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       -1,
  //       propertyType:    'apartment'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid propertyType`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const response = await api
  //     .post('/api/listings')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Beautiful Apartment',
  //       description:     'Lovely place',
  //       address:         '123 Main St',
  //       city:            'Denver',
  //       country:         'USA',
  //       pricePerNight:   120,
  //       maxGuests:       3,
  //       bedrooms:        2,
  //       bathrooms:       1,
  //       // this is either a dropdown option or selector option (I think)
  //       propertyType:    'notAnOption'
  //     })

  //   expect(response.status).toBe(422);
  // });

  it(`should reject if no auth`, async() => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .post('/api/listings')
      .send({
        title:           'Beautiful Apartment',
        description:     'Lovely place',
        address:         '123 Main St',
        city:            'Denver',
        country:         'USA',
        pricePerNight:   120,
        maxGuests:       3,
        bedrooms:        2,
        bathrooms:       1,
        propertyType:    'apartment'
      });

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/listings`, () => {
  it(`should returns active listings as host`, async () => {
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

  it(`should returns active listings not as its host`, async () => {
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

  it(`should returns active listings filter by city`, async () => {
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

  it(`should returns active listings filter by invalid city`, async () => {
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

  it(`should return 404 if nonexistent`, async () => {
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

describe(`PUT /api/listings/:id`, () => {
  it(`should update own listing as host with info successfully`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { listing } = await createTestListing(accessToken);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
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
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
      });

    expect(response.status).toBe(404);
  });

  it(`should not update a listing as guest`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'CeeCeeDoe@aria.com', 
        role:           'guest'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
      });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as admin`, async () => {
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
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
      });

    expect(response.status).toBe(403);
  });

  it(`should not update a listing as super-admin`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'super-admin'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .put(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
      });

    expect(response.status).toBe(403);
  });

  // it(`should reject if update with no title`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           '',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with no description`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     '',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with no address`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with no city`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            '',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with no country`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         '',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with no propertyType`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    ''
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid title`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       // excceed 50 character limit
  //       title:           'Cozy Mountain Cabin with Hot Tub & Stunning Views',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid description`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       // excceed 150 characters limit
  //       description:     'Charming, renovated 2-bedroom cottage nestled in the heart of downtown, offering modern amenities with cozy rustic charm. ',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with nonexisting address`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '123 Fake St',
  //       city:            'None',
  //       country:         'World',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid pricePerNight`, async() => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   0,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid maxGuests`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       0,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid bedrooms`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        0,
  //       bathrooms:       2,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid bathrooms`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       0,
  //       propertyType:    'house'
  //     })

  //   expect(response.status).toBe(422);
  // });

  // it(`should reject if update with invalid propertyType`, async () => {
  //   const { accessToken } = await registerUser(
  //     {
  //       email:          'JaneDoe@aria.com', 
  //       role:           'host'
  //     }
  //   )

  //   const { listing } = await createTestListing(accessToken)

  //   const response = await api
  //     .put(`/api/listings/${listing.id}`)
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .send({
  //       title:           'Update Title',
  //       description:     'Update Description',
  //       address:         '321 Main St',
  //       city:            'Boulder',
  //       country:         'America',
  //       pricePerNight:   250,
  //       maxGuests:       5,
  //       bedrooms:        3,
  //       bathrooms:       2,
  //       propertyType:    'notAnOption'
  //     })

  //   expect(response.status).toBe(422);
  // });

  it(`should return 404 if nonexistent`, async () => {
    const { accessToken } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const response = await api
      .put(`/api/listings/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
      });

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
      .put(`/api/listings/${listing.id}`)
      .send({
        title:           'Update Title',
        description:     'Update Description',
        address:         '321 Main St',
        city:            'Boulder',
        country:         'America',
        pricePerNight:   250,
        maxGuests:       5,
        bedrooms:        3,
        bathrooms:       2,
        propertyType:    'house'
      });

    expect(response.status).toBe(401);
  });
});

// describe(`PATCH /api/listings/:id/status`, () => {
//   it(`should update own listing to active as host successfully`, () => {

//   });

//   it(`should update own listing to inactive as host successfully`, () => {

//   });

//   it(`should not update listing to active from another host`, () => {

//   });

//   it(`should not update listing to inactive from another host`, () => {

//   });


//   it(`should not update listing to active as admin`, () => {

//   });

//   it(`should update listing to inactive/terminate as admin`, () => {

//   });

//   it(`should not update listing to active as super-admin`, () => {

//   });

//   it(`should update listing to inactive/terminate as super-admin`, () => {

//   });

//   it(`should return 404 if nonexistent`, () => {

//   });
// });

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

    expect(response.status).toBe(404);
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

  it(`should not delete a listing as super-admin`, async () => {
    const { accessToken: host1Token } = await registerUser(
      {
        email:          'JaneDoe@aria.com', 
        role:           'host'
      }
    );

    const { accessToken: host2Token } = await registerUser(
      {
        email:          'JohnDoe@aria.com', 
        role:           'super-admin'
      }
    );

    const { listing } = await createTestListing(host1Token);

    const response = await api
      .delete(`/api/listings/${listing.id}`)
      .set('Authorization', `Bearer ${host2Token}`);

    expect(response.status).toBe(403);
  });

  it(`should return 404 if nonexistent`, async () => {
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
      .delete(`/api/listings/${listing.id}`)

    expect(response.status).toBe(401);
  });
});