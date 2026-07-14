const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DDB_TABLE_AUTH_USERS = 'freshmart-test-auth-users';
process.env.COGNITO_USER_POOL_ID = 'us-east-1_testpool';
process.env.COGNITO_USER_POOL_CLIENT_ID = 'test-client';
process.env.COGNITO_USER_POOL_ISSUER = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_testpool';
process.env.COGNITO_REGION = 'us-east-1';

const { createAuthService } = require('../src/service/auth.service');

const base64url = (input) => Buffer.from(JSON.stringify(input)).toString('base64url');
const makeJwt = (payload) => `${base64url({ alg: 'RS256', typ: 'JWT', kid: 'freshmart-test' })}.${base64url(payload)}.sig`;

const buildTokens = ({ sub, email, groups = ['customers'], jti = 'jti-123', refreshToken = 'refresh-123' } = {}) => {
  const issuer = process.env.COGNITO_USER_POOL_ISSUER;
  const accessToken = makeJwt({
    sub,
    email,
    token_use: 'access',
    client_id: process.env.COGNITO_USER_POOL_CLIENT_ID,
    iss: issuer,
    jti,
    'cognito:groups': groups,
  });
  const idToken = makeJwt({
    sub,
    email,
    name: 'Customer One',
    token_use: 'id',
    aud: process.env.COGNITO_USER_POOL_CLIENT_ID,
    iss: issuer,
    jti,
    email_verified: true,
    'cognito:groups': groups,
  });

  return {
    AccessToken: accessToken,
    RefreshToken: refreshToken,
    IdToken: idToken,
    ExpiresIn: 3600,
    TokenType: 'Bearer',
  };
};

const createMockRepository = () => {
  const state = new Map();
  const writeProfile = (profile) => {
    const item = {
      ...profile,
      createdAt: profile.createdAt || '2026-07-14T00:00:00.000Z',
      updatedAt: profile.updatedAt || '2026-07-14T00:00:00.000Z',
      version: profile.version ?? 0,
    };
    state.set(String(profile.email).toLowerCase(), item);
    return item;
  };

  return {
    normalizeEmail: (value) => String(value || '').trim().toLowerCase(),
    findByEmail: async (email) => state.get(String(email).toLowerCase()) || null,
    findById: async (userId) => [...state.values()].find((item) => item.userId === userId) || null,
    createProfile: async (profile) => writeProfile(profile),
    updateProfile: async (userId, updates) => {
      const existing = [...state.values()].find((item) => item.userId === userId);
      if (!existing) return null;
      const next = { ...existing, ...updates, version: (existing.version || 0) + 1, updatedAt: '2026-07-14T00:00:00.000Z' };
      state.set(String(next.email).toLowerCase(), next);
      return next;
    },
    syncProfile: async (profile) => {
      const existing = state.get(String(profile.email).toLowerCase());
      if (!existing) {
        return writeProfile(profile);
      }
      const next = { ...existing, ...profile, version: (existing.version || 0) + 1, updatedAt: '2026-07-14T00:00:00.000Z' };
      state.set(String(next.email).toLowerCase(), next);
      return next;
    },
    markLogout: async (userId, updates) => {
      const existing = [...state.values()].find((item) => item.userId === userId);
      if (!existing) return null;
      const next = { ...existing, ...updates, version: (existing.version || 0) + 1, updatedAt: '2026-07-14T00:00:00.000Z' };
      state.set(String(next.email).toLowerCase(), next);
      return next;
    },
    _state: state,
  };
};

const createMockCognito = () => {
  const calls = [];

  return {
    calls,
    adminCreateUser: async (input) => {
      calls.push(['adminCreateUser', input]);
      return { ok: true };
    },
    adminSetUserPassword: async (input) => {
      calls.push(['adminSetUserPassword', input]);
    },
    adminAddUserToGroups: async (input) => {
      calls.push(['adminAddUserToGroups', input]);
    },
    initiateAuth: async (input) => {
      calls.push(['initiateAuth', input]);
      return { AuthenticationResult: buildTokens({ sub: 'user-123', email: input.username }) };
    },
    refreshAuth: async (input) => {
      calls.push(['refreshAuth', input]);
      return { AuthenticationResult: buildTokens({ sub: 'user-123', email: 'customer@example.com', refreshToken: null, jti: 'jti-456' }) };
    },
    revokeToken: async (input) => {
      calls.push(['revokeToken', input]);
    },
    globalSignOut: async (input) => {
      calls.push(['globalSignOut', input]);
    },
    forgotPassword: async (input) => {
      calls.push(['forgotPassword', input]);
      return { CodeDeliveryDetails: { Destination: 'customer@example.com' } };
    },
    confirmForgotPassword: async (input) => {
      calls.push(['confirmForgotPassword', input]);
    },
    getVerificationCode: async (input) => {
      calls.push(['getVerificationCode', input]);
      return { CodeDeliveryDetails: { Destination: 'customer@example.com' } };
    },
    verifyAttribute: async (input) => {
      calls.push(['verifyAttribute', input]);
    },
    changePassword: async (input) => {
      calls.push(['changePassword', input]);
    },
    associateSoftwareToken: async (input) => {
      calls.push(['associateSoftwareToken', input]);
      return { SecretCode: 'otpauth://totp/freshmart' };
    },
    verifySoftwareToken: async (input) => {
      calls.push(['verifySoftwareToken', input]);
      return { Status: 'SUCCESS' };
    },
    setMfaPreference: async (input) => {
      calls.push(['setMfaPreference', input]);
    },
    respondToAuthChallenge: async (input) => {
      calls.push(['respondToAuthChallenge', input]);
      return { AuthenticationResult: buildTokens({ sub: 'user-123', email: 'customer@example.com', jti: 'jti-789' }) };
    },
    adminDeleteUser: async (input) => {
      calls.push(['adminDeleteUser', input]);
    },
    adminGetUser: async (input) => {
      calls.push(['adminGetUser', input]);
      return {
        UserAttributes: [
          { Name: 'sub', Value: 'user-123' },
          { Name: 'email', Value: 'customer@example.com' },
          { Name: 'name', Value: 'Customer One' },
          { Name: 'cognito:username', Value: input.username },
          { Name: 'cognito:groups', Value: 'customers' },
        ],
      };
    },
  };
};

test('register creates the Cognito user and profile', async () => {
  const repository = createMockRepository();
  const cognito = createMockCognito();
  const events = [];
  const service = createAuthService({
    repository,
    cognito,
    eventPublisher: {
      publishUserRegistered: async (payload) => events.push(['registered', payload]),
      publishUserLoggedIn: async () => {},
      publishUserLoggedOut: async () => {},
      publishPasswordChanged: async () => {},
    },
  });

  const result = await service.register(
    {
      name: 'Customer One',
      email: 'customer@example.com',
      password: 'Password!1',
      phone: '+15555550123',
    },
    { requestId: 'req-1' }
  );

  assert.equal(result.user.email, 'customer@example.com');
  assert.equal(result.accessToken.includes('.'), true);
  assert.equal(cognito.calls.some(([name]) => name === 'adminCreateUser'), true);
  assert.equal(events[0][0], 'registered');
});

test('login returns Cognito tokens and syncs the profile', async () => {
  const repository = createMockRepository();
  await repository.createProfile({
    userId: 'user-123',
    cognitoSub: 'user-123',
    username: 'customer@example.com',
    name: 'Customer One',
    email: 'customer@example.com',
    role: 'CUSTOMER',
  });
  const cognito = createMockCognito();
  const events = [];
  const service = createAuthService({
    repository,
    cognito,
    eventPublisher: {
      publishUserRegistered: async () => {},
      publishUserLoggedIn: async (payload) => events.push(['logged-in', payload]),
      publishUserLoggedOut: async () => {},
      publishPasswordChanged: async () => {},
    },
  });

  const result = await service.login({ email: 'customer@example.com', password: 'Password!1' });
  assert.equal(result.user.userId, 'user-123');
  assert.equal(result.refreshToken, 'refresh-123');
  assert.equal(events[0][0], 'logged-in');
});

test('refresh keeps the Cognito session and returns the profile', async () => {
  const repository = createMockRepository();
  await repository.createProfile({
    userId: 'user-123',
    cognitoSub: 'user-123',
    username: 'customer@example.com',
    name: 'Customer One',
    email: 'customer@example.com',
    role: 'CUSTOMER',
  });
  const cognito = createMockCognito();
  const service = createAuthService({ repository, cognito });

  const result = await service.refresh('refresh-123');
  assert.equal(result.user.email, 'customer@example.com');
  assert.equal(result.accessToken.includes('.'), true);
});

test('logout revokes refresh tokens and signs the session out', async () => {
  const repository = createMockRepository();
  await repository.createProfile({
    userId: 'user-123',
    cognitoSub: 'user-123',
    username: 'customer@example.com',
    name: 'Customer One',
    email: 'customer@example.com',
    role: 'CUSTOMER',
  });
  const cognito = createMockCognito();
  const events = [];
  const service = createAuthService({
    repository,
    cognito,
    eventPublisher: {
      publishUserRegistered: async () => {},
      publishUserLoggedIn: async () => {},
      publishUserLoggedOut: async (payload) => events.push(['logged-out', payload]),
      publishPasswordChanged: async () => {},
    },
  });

  await service.logout(
    {
      refreshToken: 'refresh-123',
      accessToken: buildTokens({ sub: 'user-123', email: 'customer@example.com' }).AccessToken,
    },
    { requestId: 'req-logout' }
  );

  assert.equal(cognito.calls.some(([name]) => name === 'revokeToken'), true);
  assert.equal(cognito.calls.some(([name]) => name === 'globalSignOut'), true);
  assert.equal(events[0][0], 'logged-out');
});

test('completeChallenge resolves MFA-backed sign-in', async () => {
  const repository = createMockRepository();
  const cognito = createMockCognito();
  const service = createAuthService({
    repository,
    cognito,
    eventPublisher: {
      publishUserRegistered: async () => {},
      publishUserLoggedIn: async () => {},
      publishUserLoggedOut: async () => {},
      publishPasswordChanged: async () => {},
    },
  });

  const result = await service.respondToMfaChallenge(
    {
      challengeName: 'SOFTWARE_TOKEN_MFA',
      session: 'session-token',
      challengeResponses: { USERNAME: 'customer@example.com', SOFTWARE_TOKEN_MFA_CODE: '123456' },
    },
    { requestId: 'req-mfa' }
  );

  assert.equal(result.user.email, 'customer@example.com');
  assert.equal(result.accessToken.includes('.'), true);
});

test('changePassword publishes a password-changed event', async () => {
  const repository = createMockRepository();
  await repository.createProfile({
    userId: 'user-123',
    cognitoSub: 'user-123',
    username: 'customer@example.com',
    name: 'Customer One',
    email: 'customer@example.com',
    role: 'CUSTOMER',
  });
  const cognito = createMockCognito();
  const events = [];
  const service = createAuthService({
    repository,
    cognito,
    eventPublisher: {
      publishUserRegistered: async () => {},
      publishUserLoggedIn: async () => {},
      publishUserLoggedOut: async () => {},
      publishPasswordChanged: async (payload) => events.push(payload),
    },
  });

  await service.changePassword(
    {
      accessToken: buildTokens({ sub: 'user-123', email: 'customer@example.com' }).AccessToken,
      previousPassword: 'Password!1',
      proposedPassword: 'NewPassword!2',
    },
    { requestId: 'req-password' }
  );

  assert.equal(events.length, 1);
  assert.equal(events[0].reason, 'CHANGE');
});
