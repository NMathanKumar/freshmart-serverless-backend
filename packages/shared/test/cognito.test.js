const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const jwt = require('jsonwebtoken');

test('verifyCognitoJwt validates Cognito access tokens against JWKS', async () => {
  process.env.COGNITO_USER_POOL_ID = 'us-east-1_testpool';
  process.env.COGNITO_USER_POOL_CLIENT_ID = 'test-client';
  process.env.COGNITO_USER_POOL_ISSUER = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_testpool';
  process.env.COGNITO_JWKS_URL = 'https://example.com/.well-known/jwks.json';

  delete require.cache[require.resolve('../src/auth/cognito')];
  const { verifyCognitoJwt, mapCognitoGroupsToRole, extractCognitoUser } = require('../src/auth/cognito');

  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' });
  jwk.kid = 'freshmart-test';
  jwk.use = 'sig';
  jwk.alg = 'RS256';

  const token = jwt.sign(
    {
      sub: 'user-123',
      email: 'customer@example.com',
      token_use: 'access',
      client_id: 'test-client',
      iss: process.env.COGNITO_USER_POOL_ISSUER,
      jti: 'jti-123',
      'cognito:groups': ['customers'],
    },
    privateKey.export({ format: 'pem', type: 'pkcs8' }),
    {
      algorithm: 'RS256',
      header: { kid: jwk.kid },
      expiresIn: '1h',
    }
  );

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ keys: [jwk] }),
    headers: {
      get: (name) => (String(name).toLowerCase() === 'cache-control' ? 'max-age=60' : null),
    },
  });

  try {
    const payload = await verifyCognitoJwt(token);
    assert.equal(payload.sub, 'user-123');
    assert.equal(payload.client_id, 'test-client');
    assert.equal(mapCognitoGroupsToRole(payload), 'CUSTOMER');
    assert.deepEqual(extractCognitoUser(payload).groups, ['customers']);
  } finally {
    global.fetch = originalFetch;
  }
});
