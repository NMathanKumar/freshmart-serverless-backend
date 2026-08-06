const test = require('node:test');
const assert = require('node:assert/strict');
test('Cognito helpers map claim groups into shared authorization roles', () => {
  process.env.COGNITO_GROUP_ADMINS = 'admins';
  process.env.COGNITO_GROUP_STAFF = 'staff';
  process.env.COGNITO_GROUP_CUSTOMERS = 'customers';

  delete require.cache[require.resolve('../src/auth/cognito')];
  const { mapCognitoGroupsToRole, extractCognitoUser } = require('../src/auth/cognito');

  const payload = {
    sub: 'user-123',
    email: 'customer@example.com',
    token_use: 'access',
    'cognito:groups': ['customers'],
  };

  assert.equal(mapCognitoGroupsToRole(payload), 'CUSTOMER');
  assert.deepEqual(extractCognitoUser(payload).groups, ['customers']);
});
