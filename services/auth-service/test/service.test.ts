import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../src/services/index.js';
import { InMemoryAuthRepository } from '../src/repositories/index.js';

test('auth service registers a profile with an active status', async () => {
  const service = new AuthService({
    repository: new InMemoryAuthRepository(),
    identityProvider: {
      register: async ({ email, firstName, lastName }) => ({
        userId: 'user-123',
        username: email,
        email,
        firstName,
        lastName
      }),
      login: async () => ({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }),
      refresh: async () => ({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }),
      logout: async () => {}
    }
  });

  const profile = await service.register({
    email: 'principal@freshmart.com',
    password: 'Password!1',
    firstName: 'Principal',
    lastName: 'Architect'
  });

  assert.equal(profile.status, 'ACTIVE');
  assert.equal(profile.roles.includes('customer'), true);
});
