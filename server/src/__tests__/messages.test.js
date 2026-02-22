import { describe, it, beforeAll, afterEach, afterAll }  from '@jest/globals';
// import { describe, it, expect, beforeAll, afterEach, afterAll }  from '@jest/globals';
// import { api, registerUser, createTestListing }                  from './helpers.js';
import { setupTestDB, clearTestDB, closeTestDB }                 from './setup.js';

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async ()  => await closeTestDB());

describe(`To Do`, () => {
  it.todo('bookings tests coming soon');
});