import assert from 'node:assert/strict';
import test from 'node:test';
import { UserService } from '../src/services/index.js';
import { InMemoryUserRepository } from '../src/repositories/index.js';

test('user service adds addresses to the profile aggregate', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);

  await service.upsertProfile('user-1', {
    firstName: 'Fresh',
    lastName: 'Mart',
    email: 'customer@freshmart.com'
  });

  const profile = await service.addAddress('user-1', {
    label: 'Home',
    line1: '42 Market Street',
    city: 'Bengaluru',
    state: 'KA',
    postalCode: '560001'
  });

  assert.equal(profile.addresses.length, 1);
});