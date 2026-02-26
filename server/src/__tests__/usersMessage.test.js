import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { api, registerUser, createTestListing }                 from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                from './setup.js';
import pool                                                     from '../db/pool.js';


beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`POST /api/messages`, () => {
  it(`should start a conversation with initial message as guest successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    expect(response1.status).toBe(201);
    expect(response1.body.conversation.guest_id).toBeDefined();

    const conversationId = response1.body.conversation.id;
    const response2 = await api
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response2.status).toBe(200);
    expect(response2.body.messages.length).toBe(1);
    expect(response2.body.messages[0].body).toBe('Hi, is this listing available?');
  });

  it(`should return existing conversation if already started`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const response = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'A follow up question',
      });

    expect(response.status).toBe(201);
  });

  it(`should reject if message body is empty`, async () => {
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
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   ''
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if listing does not exist`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: '00000000-0000-0000-0000-000000000000',
        hostId:    '00000000-0000-0000-0000-000000000000',
        message:   'Hi, is this listing available?'
      });

    expect(response.status).toBe(404);
  });

  it(`should reject if host does not match listing`, async () => {
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
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    '00000000-0000-0000-0000-000000000000',
        message:   'Hi, is this listing available?'
      });

    expect(response.status).toBe(400);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response = await api
      .post('/api/messages')
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    expect(response.status).toBe(401);
  });
});

describe(`GET /api/messages`, () => {
  it(`should return own conversations as guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const response = await api
      .get('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.conversations.length).toBe(1);
  });

  it(`should return own conversations as host`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const response = await api
      .get('/api/messages')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response.status).toBe(200);
    expect(response.body.conversations.length).toBe(1);
  });

  it(`should return empty array if no conversations`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .get('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(200);
    expect(response.body.conversations.length).toBe(0);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const response = await api
      .get('/api/messages');
    
    expect(response.status).toBe(401);
  });
});

describe(`POST /api/messages/:conversationId`, () => {
  it(`should send a message as guest successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    const response2 = await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: 'Also, do you allow pets?' });

    expect(response2.status).toBe(201);
    expect(response2.body.message.body).toBe('Also, do you allow pets?');
  });

  it(`should send a message as host successfully`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    const response2 = await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ body: 'Hello, yes, it is still available.' });

    expect(response2.status).toBe(201);
    expect(response2.body.message.body).toBe('Hello, yes, it is still available.');
  });

  it(`should reject if empty message body`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;
    const response2 = await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: '' });

    expect(response2.status).toBe(400);
  });

  it(`should reject if not a participant`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guest1Token } = await registerUser({
      email: 'guest1@aria.com',
      role:  'guest'
    });

    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guest1Token}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;
    const response2 = await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({ body: 'Also, do you allow pets?' });

    expect(response2.status).toBe(403);
  });

  it(`should reject if nonexistent conversation`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .post('/api/messages/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: 'Also, do you allow pets?' });

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    const response2 = await api
      .post(`/api/messages/${conversationId}`)
      .send({ body: 'Also, do you allow pets?' });

    expect(response2.status).toBe(401);
  });
});

describe(`GET /api/messages/:conversationId`, () => {
  it(`should return messages in a conversation as guest`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: 'Hi, is your listing still available?' });

    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ body: 'Hello, yes, it is!' });

    const response2 = await api
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response2.status).toBe(200);
    expect(response2.body.messages.length).toBe(3);
    expect(response2.body.messages[0].body).toBe('Hi, is this listing available?');
    expect(response2.body.messages[1].body).toBe('Hi, is your listing still available?');
    expect(response2.body.messages[2].body).toBe('Hello, yes, it is!');
  });

  it(`should return messages in a conversation as host`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: 'Hi, is your listing still available?' });

    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ body: 'Hello, yes, it is!' });

    const response2 = await api
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(response2.status).toBe(200);
    expect(response2.body.messages.length).toBe(3);
    expect(response2.body.messages[0].body).toBe('Hi, is this listing available?');
    expect(response2.body.messages[1].body).toBe('Hi, is your listing still available?');
    expect(response2.body.messages[2].body).toBe('Hello, yes, it is!');
  });

  it(`should mark messages as read when fetched`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    // host fetches — marks guest's message as read
    await api
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`);

    // host sends reply
    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ body: 'Yes, it is available!' });

    // guest fetches — marks host's message as read
    await api
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    // check DB directly that all messages are read
    const { rows } = await pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1 AND is_read = false`,
      [conversationId]
    );

    expect(rows.length).toBe(0);
  });

  it(`should reject if not a participant`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guest1Token } = await registerUser({
      email: 'guest1@aria.com',
      role:  'guest'
    });

    const { accessToken: guest2Token } = await registerUser({
      email: 'guest2@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guest1Token}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    const response2 = await api
      .get(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guest2Token}`);

    expect(response2.status).toBe(403);
  });

  it(`should reject if nonexistent conversation`, async () => {
    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const response = await api
      .get('/api/messages/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(response.status).toBe(404);
  });

  it(`should reject if no auth`, async () => {
    const { accessToken: hostToken } = await registerUser({
      email: 'JaneDoe@aria.com',
      role:  'host'
    });

    const { accessToken: guestToken } = await registerUser({
      email: 'guest@aria.com',
      role:  'guest'
    });

    const { listing } = await createTestListing(hostToken);

    const response1 = await api
      .post('/api/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing.id,
        hostId:    listing.hostId,
        message:   'Hi, is this listing available?'
      });

    const conversationId = response1.body.conversation.id;

    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: 'Hi, is your listing still available?' });

    await api
      .post(`/api/messages/${conversationId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ body: 'Hello, yes, it is!' });

    const response2 = await api
      .get(`/api/messages/${conversationId}`);

    expect(response2.status).toBe(401);
  });
});