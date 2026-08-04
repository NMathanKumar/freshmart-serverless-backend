import assert from 'node:assert/strict';
import test from 'node:test';

test('wishlist lambda health endpoint is reachable', async () => {
  process.env.AWS_REGION = 'us-east-1';
  process.env.TABLE_NAME = 'freshmart-test-wishlist';
  process.env.COGNITO_USER_POOL_ID = 'us-east-1_test';
  process.env.COGNITO_APP_CLIENT_ID = 'client';

  const { handler } = await import('../../services/wishlist-service/src/index.ts');

  const response = await handler({
    version: '2.0',
    routeKey: 'GET /health',
    rawPath: '/health',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: '123456789012',
      apiId: 'api',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      http: {
        method: 'GET',
        path: '/health',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test'
      },
      requestId: 'req-health',
      routeKey: 'GET /health',
      stage: '$default',
      time: '',
      timeEpoch: Date.now()
    },
    body: undefined,
    isBase64Encoded: false
  });

  assert.equal(response.statusCode, 200);
});

test('wishlist lambda protects /api/v1 routes with RFC7807 responses', async () => {
  process.env.AWS_REGION = 'us-east-1';
  process.env.TABLE_NAME = 'freshmart-test-wishlist';
  process.env.COGNITO_USER_POOL_ID = 'us-east-1_test';
  process.env.COGNITO_APP_CLIENT_ID = 'client';

  const { handler } = await import('../../services/wishlist-service/src/index.ts');

  const response = await handler({
    version: '2.0',
    routeKey: 'POST /api/v1/wishlist/items',
    rawPath: '/api/v1/wishlist/items',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: '123456789012',
      apiId: 'api',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      http: {
        method: 'POST',
        path: '/api/v1/wishlist/items',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test'
      },
      requestId: 'req-1',
      routeKey: 'POST /api/v1/wishlist/items',
      stage: '$default',
      time: '',
      timeEpoch: Date.now()
    },
    body: JSON.stringify({
      customerId: 'customer-1',
      productId: 'prod-1',
      sku: 'BANANA-1KG',
      productName: 'Organic Banana'
    }),
    isBase64Encoded: false
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['content-type'], 'application/problem+json');

  const body = JSON.parse(response.body ?? '{}');
  assert.equal(body.status, 401);
  assert.equal(body.title, 'Unauthorized');
});
