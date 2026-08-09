const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getAuthorizerClaims,
  buildCurrentUserFromClaims,
  requireCurrentUser,
  mapCognitoGroupsToRoles,
} = require('../src/auth');

test('getAuthorizerClaims reads HTTP API JWT claims from the API Gateway event', () => {
  const req = {
    apiGateway: {
      event: {
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                sub: 'user-123',
                email: 'customer@example.com',
              },
            },
          },
        },
      },
    },
  };

  assert.deepEqual(getAuthorizerClaims(req), {
    sub: 'user-123',
    email: 'customer@example.com',
  });
});

test('buildCurrentUserFromClaims normalizes Cognito identities and roles', () => {
  const user = buildCurrentUserFromClaims({
    sub: 'user-123',
    email: 'admin@example.com',
    'cognito:username': 'admin-user',
    'cognito:groups': ['admins', 'manager'],
    scope: 'openid email profile',
    token_use: 'access',
  });

  assert.equal(user.userId, 'user-123');
  assert.equal(user.role, 'ADMIN');
  assert.deepEqual(user.roles, ['ADMIN', 'STAFF']);
  assert.deepEqual(user.groups, ['admins', 'manager']);
  assert.deepEqual(user.scope, ['openid', 'email', 'profile']);
  assert.equal(user.username, 'admin-user');
});

test('mapCognitoGroupsToRoles maps manager groups into the shared staff role', () => {
  assert.deepEqual(mapCognitoGroupsToRoles({ 'cognito:groups': ['manager'] }), ['STAFF']);
});

test('requireCurrentUser rejects requests without authorizer claims', () => {
  assert.throws(() => requireCurrentUser({ headers: {} }), /Missing JWT authorizer claims/);
});
