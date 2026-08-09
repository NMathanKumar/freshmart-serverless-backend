process.env.AWS_LAMBDA_FUNCTION_NAME = 'freshmart-runtime-contract-test';
process.env.NODE_ENV = 'test';
process.env.SERVICE_NAME = 'runtime-contract-test';
process.env.RATE_LIMIT_MAX = '1000';

const test = require('node:test');
const assert = require('node:assert/strict');

const runtime = require('../src/runtime');
const shared = require('../src');

const createV1Event = (path, method = 'GET') => ({
  httpMethod: method,
  path,
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  requestContext: {
    stage: 'v1',
    requestId: 'request-v1',
    identity: { sourceIp: '127.0.0.1' },
  },
  body: null,
  isBase64Encoded: false,
});

const createV2Event = (path, method = 'GET') => ({
  version: '2.0',
  routeKey: `${method} ${path}`,
  rawPath: path,
  rawQueryString: '',
  headers: {},
  requestContext: {
    stage: 'v1',
    requestId: 'request-v2',
    http: {
      method,
      path,
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
    },
  },
  body: null,
  isBase64Encoded: false,
});

test('runtime wrappers are exported from both entrypoints', () => {
  for (const exportName of ['createServiceApp', 'createLambdaHandler', 'createEventLambda']) {
    assert.equal(typeof runtime[exportName], 'function');
    assert.equal(shared[exportName], runtime[exportName]);
  }
});

test('createServiceApp validates its arguments and returns an Express application', () => {
  assert.throws(() => runtime.createServiceApp(null), /options must be an object/);
  assert.throws(
    () => runtime.createServiceApp({ mountRoutes: true }),
    /mountRoutes must be a function/
  );
  assert.equal(typeof runtime.createServiceApp(), 'function');
});

test('createLambdaHandler serves health for API Gateway payload v1', async () => {
  const app = runtime.createServiceApp();
  const handler = runtime.createLambdaHandler(app);
  const context = {};

  assert.equal(typeof handler, 'function');
  const response = await handler(createV1Event('/v1/health'), context);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    ok: true,
    service: 'runtime-contract-test',
  });
  assert.equal(context.callbackWaitsForEmptyEventLoop, false);
});

test('createLambdaHandler serves health for API Gateway payload v2', async () => {
  const app = runtime.createServiceApp();
  const handler = runtime.createLambdaHandler(app);
  const context = {};

  const response = await handler(createV2Event('/v1/health'), context);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    ok: true,
    service: 'runtime-contract-test',
  });
  assert.equal(context.callbackWaitsForEmptyEventLoop, false);
});

test('createServiceApp returns the shared 404 response', async () => {
  const handler = runtime.createLambdaHandler(runtime.createServiceApp());
  const response = await handler(createV2Event('/v1/missing'), {});
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 404);
  assert.equal(body.errorCode, 'ROUTE_NOT_FOUND');
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
});

test('createServiceApp routes unexpected errors through the shared error handler', async () => {
  const app = runtime.createServiceApp({
    mountRoutes(expressApp) {
      expressApp.get('/boom', () => {
        throw new Error('runtime contract failure');
      });
    },
  });
  const handler = runtime.createLambdaHandler(app);
  const response = await handler(createV1Event('/v1/boom'), {});
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 500);
  assert.equal(body.errorCode, 'INTERNAL_ERROR');
  assert.equal(body.error.code, 'INTERNAL_ERROR');
  assert.equal(body.message, 'runtime contract failure');
});

test('createLambdaHandler rejects a missing Express application', () => {
  assert.throws(
    () => runtime.createLambdaHandler(),
    /requires an Express application/
  );
});

test('createEventLambda preserves dispatch behavior and adds the consumer name', async () => {
  const event = { id: 'event-1' };
  const context = {};
  let receivedEvent;
  let receivedContext;
  const handler = runtime.createEventLambda('analytics-service', async (nextEvent, nextContext) => {
    receivedEvent = nextEvent;
    receivedContext = nextContext;
    return { statusCode: 202, body: 'accepted' };
  });

  assert.equal(typeof handler, 'function');
  const response = await handler(event, context);

  assert.equal(receivedEvent, event);
  assert.equal(receivedContext, context);
  assert.deepEqual(response, {
    statusCode: 202,
    body: 'accepted',
    consumerName: 'analytics-service',
  });
  assert.equal(context.callbackWaitsForEmptyEventLoop, false);
});

test('createEventLambda validates its factory arguments', () => {
  assert.throws(() => runtime.createEventLambda('', async () => ({})), /requires a consumer name/);
  assert.throws(
    () => runtime.createEventLambda('analytics-service'),
    /requires a dispatchEvent function/
  );
});
