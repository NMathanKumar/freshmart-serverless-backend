const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const AWS_REGION = process.env.AWS_REGION || process.env.SMOKE_AWS_REGION || 'ap-southeast-1';
const API_NAME = process.env.SMOKE_API_NAME || 'freshmart-dev-api';
const REPORT_PATH = process.env.SMOKE_REPORT_PATH || path.join(process.cwd(), 'artifacts', 'live-smoke-report.json');
const FAIL_ON_SKIPS = String(process.env.SMOKE_FAIL_ON_SKIPS || 'false').toLowerCase() === 'true';

const protectedRouteKeys = [
  'POST /auth/logout',
  'GET /auth/me',
  'POST /auth/verification/email/request',
  'POST /auth/verification/email/confirm',
  'POST /auth/change-password',
  'POST /auth/mfa/setup',
  'POST /auth/mfa/verify',
  'POST /auth/mfa/preference',
  'GET /products/search',
  'GET /products',
  'GET /products/{id}',
  'POST /products',
  'PUT /products/{id}',
  'DELETE /products/{id}',
  'GET /menu/search',
  'GET /menu',
  'GET /menu/{id}',
  'POST /menu',
  'PATCH /menu/{id}',
  'PATCH /menu/{id}/availability',
  'DELETE /menu/{id}',
  'GET /inventory',
  'PUT /inventory/{productId}',
  'GET /cart',
  'POST /cart',
  'PATCH /cart/{productId}',
  'DELETE /cart/{productId}',
  'GET /users/profile',
  'PUT /users/profile',
  'POST /users/addresses',
  'GET /orders',
  'POST /orders',
  'GET /orders/{orderId}',
  'PUT /orders/{orderId}/cancel',
  'POST /payments',
  'GET /payments/{paymentId}',
  'GET /admin/health',
  'GET /admin/dashboard',
  'GET /admin/config',
  'PUT /admin/config',
  'GET /admin/audit',
];

const randomSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const smokePassword = `FreshMart!${Math.random().toString(36).slice(2, 6)}A1`;

const ensureDir = (filePath) => fs.mkdirSync(path.dirname(filePath), { recursive: true });

const execAwsJson = (args) =>
  JSON.parse(execFileSync('aws', [...args, '--region', AWS_REGION], { encoding: 'utf8' }));

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const hasKeys = (value, keys) =>
  value && typeof value === 'object' && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));

const createReporter = () => {
  const checks = [];

  const record = async (name, fn, options = {}) => {
    try {
      const result = await fn();
      checks.push({
        name,
        category: options.category || 'general',
        status: result?.status || 'pass',
        details: result?.details || null,
      });
      return result;
    } catch (error) {
      checks.push({
        name,
        category: options.category || 'general',
        status: options.optional ? 'skip' : 'fail',
        details: {
          message: error instanceof Error ? error.message : String(error),
        },
      });
      return null;
    }
  };

  return { checks, record };
};

const resolveApiBaseUrl = () => {
  if (process.env.SMOKE_API_BASE_URL) {
    return process.env.SMOKE_API_BASE_URL.replace(/\/$/, '');
  }

  const apis = execAwsJson(['apigatewayv2', 'get-apis']);
  const api = (apis.Items || []).find((item) => item.Name === API_NAME);
  if (!api?.ApiEndpoint) {
    throw new Error(`Unable to resolve API endpoint for '${API_NAME}'.`);
  }
  return `${api.ApiEndpoint.replace(/\/$/, '')}/v1`;
};

const resolveApiId = () => {
  if (process.env.SMOKE_API_ID) {
    return process.env.SMOKE_API_ID;
  }

  const apis = execAwsJson(['apigatewayv2', 'get-apis']);
  const api = (apis.Items || []).find((item) => item.Name === API_NAME);
  if (!api?.ApiId) {
    throw new Error(`Unable to resolve API id for '${API_NAME}'.`);
  }
  return api.ApiId;
};

const createClient = (baseUrl) => {
  const request = async (method, resourcePath, { token, body, headers = {} } = {}) => {
    const response = await fetch(`${baseUrl}${resourcePath}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await safeJson(response),
    };
  };

  return {
    get: (resourcePath, options) => request('GET', resourcePath, options),
    post: (resourcePath, body, options = {}) => request('POST', resourcePath, { ...options, body }),
    put: (resourcePath, body, options = {}) => request('PUT', resourcePath, { ...options, body }),
    patch: (resourcePath, body, options = {}) => request('PATCH', resourcePath, { ...options, body }),
    delete: (resourcePath, options = {}) => request('DELETE', resourcePath, options),
  };
};

const expectStatus = (response, allowed, label) => {
  if (!allowed.includes(response.status)) {
    throw new Error(`${label} returned ${response.status}; expected ${allowed.join(', ')}`);
  }
};

const expectSuccessEnvelope = (response, label) => {
  if (!hasKeys(response.body, ['success', 'message', 'data', 'timestamp'])) {
    throw new Error(`${label} did not return the expected success envelope`);
  }
};

const expectErrorEnvelope = (response, label) => {
  if (!hasKeys(response.body, ['success', 'message', 'errorCode', 'timestamp'])) {
    throw new Error(`${label} did not return the expected error envelope`);
  }
};

const expectUnauthorizedShape = (response, label) => {
  if (response.status !== 401) {
    throw new Error(`${label} returned ${response.status}; expected 401`);
  }

  const body = response.body;
  const isRepoError = hasKeys(body, ['success', 'message', 'errorCode', 'timestamp']);
  const isGatewayError =
    body &&
    typeof body === 'object' &&
    (
      typeof body.message === 'string' ||
      typeof body.Message === 'string'
    );

  if (!isRepoError && !isGatewayError) {
    throw new Error(`${label} did not return a recognized unauthorized response body`);
  }
};

const loginWithAdmin = async (client) => {
  if (process.env.SMOKE_ADMIN_ACCESS_TOKEN) {
    return process.env.SMOKE_ADMIN_ACCESS_TOKEN;
  }
  if (!process.env.SMOKE_ADMIN_EMAIL || !process.env.SMOKE_ADMIN_PASSWORD) {
    return null;
  }
  const response = await client.post('/auth/login', {
    email: process.env.SMOKE_ADMIN_EMAIL,
    password: process.env.SMOKE_ADMIN_PASSWORD,
  });
  expectStatus(response, [200], 'admin login');
  expectSuccessEnvelope(response, 'admin login');
  const accessToken = response.body?.data?.accessToken;
  if (!accessToken) {
    throw new Error('Admin login did not return an access token.');
  }
  return accessToken;
};

const auditLiveRouteProtection = () => {
  const routes = execAwsJson(['apigatewayv2', 'get-routes', '--api-id', resolveApiId()]);
  const mismatches = [];

  for (const routeKey of protectedRouteKeys) {
    const route = (routes.Items || []).find((item) => item.RouteKey === routeKey);
    if (!route) {
      mismatches.push({ routeKey, problem: 'missing' });
      continue;
    }
    if (route.AuthorizationType !== 'JWT') {
      mismatches.push({ routeKey, authorizationType: route.AuthorizationType || 'UNKNOWN' });
    }
  }

  return {
    totalProtectedRoutes: protectedRouteKeys.length,
    mismatches,
  };
};

const main = async () => {
  const reporter = createReporter();
  const baseUrl = resolveApiBaseUrl();
  const client = createClient(baseUrl);

  const state = {
    customerEmail: `smoke-${randomSuffix()}@example.com`,
    customerPassword: smokePassword,
    customerToken: null,
    refreshToken: null,
    adminToken: null,
    createdProductId: null,
    createdOrderId: null,
    createdPaymentId: null,
  };

  await reporter.record('API Gateway JWT protection audit', async () => {
    const audit = auditLiveRouteProtection();
    if (audit.mismatches.length > 0) {
      throw new Error(`Protected route mismatches detected: ${audit.mismatches.length}`);
    }
    return { details: audit, category: 'jwt' };
  }, { category: 'jwt' });

  await reporter.record('Register rejects missing payload', async () => {
    const response = await client.post('/auth/register', {});
    expectStatus(response, [400, 422], 'register validation');
    expectErrorEnvelope(response, 'register validation');
    return { details: { status: response.status }, category: 'auth' };
  }, { category: 'auth' });

  await reporter.record('Customer registration succeeds', async () => {
    const response = await client.post('/auth/register', {
      name: 'FreshMart Smoke Tester',
      email: state.customerEmail,
      password: state.customerPassword,
      phone: '+6599999999',
    });
    expectStatus(response, [201], 'register');
    expectSuccessEnvelope(response, 'register');
    if (!response.body?.data?.accessToken || !response.body?.data?.refreshToken) {
      throw new Error('Register response is missing tokens.');
    }
    state.customerToken = response.body.data.accessToken;
    state.refreshToken = response.body.data.refreshToken;
    return {
      details: { email: state.customerEmail, userId: response.body?.data?.user?.userId || null },
      category: 'auth',
    };
  }, { category: 'auth' });

  await reporter.record('Customer login succeeds', async () => {
    const response = await client.post('/auth/login', {
      email: state.customerEmail,
      password: state.customerPassword,
    });
    expectStatus(response, [200], 'login');
    expectSuccessEnvelope(response, 'login');
    if (!response.body?.data?.accessToken) {
      throw new Error('Login response is missing accessToken.');
    }
    state.customerToken = response.body.data.accessToken;
    state.refreshToken = response.body.data.refreshToken || state.refreshToken;
    return { details: { status: response.status }, category: 'auth' };
  }, { category: 'auth' });

  await reporter.record('Refresh succeeds', async () => {
    const response = await client.post('/auth/refresh', { refreshToken: state.refreshToken });
    expectStatus(response, [200], 'refresh');
    expectSuccessEnvelope(response, 'refresh');
    if (!response.body?.data?.accessToken) {
      throw new Error('Refresh response is missing accessToken.');
    }
    state.customerToken = response.body.data.accessToken;
    state.refreshToken = response.body.data.refreshToken || state.refreshToken;
    return { details: { status: response.status }, category: 'auth' };
  }, { category: 'auth' });

  await reporter.record('Protected /auth/me rejects anonymous calls', async () => {
    const response = await client.get('/auth/me');
    expectUnauthorizedShape(response, 'auth me anonymous');
    return { details: { status: response.status }, category: 'auth' };
  }, { category: 'auth' });

  await reporter.record('Protected /auth/me succeeds with JWT', async () => {
    const response = await client.get('/auth/me', { token: state.customerToken });
    expectStatus(response, [200], 'auth me');
    expectSuccessEnvelope(response, 'auth me');
    return { details: { status: response.status }, category: 'auth' };
  }, { category: 'auth' });

  await reporter.record('Products reject anonymous calls', async () => {
    const response = await client.get('/products');
    expectUnauthorizedShape(response, 'products anonymous');
    return { details: { status: response.status }, category: 'products' };
  }, { category: 'products' });

  await reporter.record('Products list returns success envelope', async () => {
    const response = await client.get('/products', { token: state.customerToken });
    expectStatus(response, [200], 'products list');
    expectSuccessEnvelope(response, 'products list');
    return {
      details: { status: response.status, itemCount: Array.isArray(response.body?.data) ? response.body.data.length : null },
      category: 'products',
    };
  }, { category: 'products' });

  await reporter.record('Products missing resource returns 404', async () => {
    const response = await client.get(`/products/PROD-${randomSuffix()}`, { token: state.customerToken });
    expectStatus(response, [404], 'products missing');
    expectErrorEnvelope(response, 'products missing');
    return { details: { status: response.status }, category: 'products' };
  }, { category: 'products' });

  await reporter.record('Menu list returns success envelope', async () => {
    const response = await client.get('/menu', { token: state.customerToken });
    expectStatus(response, [200], 'menu list');
    expectSuccessEnvelope(response, 'menu list');
    return { details: { status: response.status }, category: 'menu' };
  }, { category: 'menu' });

  await reporter.record('Menu search returns success envelope', async () => {
    const response = await client.get('/menu/search?q=smoke', { token: state.customerToken });
    expectStatus(response, [200], 'menu search');
    expectSuccessEnvelope(response, 'menu search');
    return { details: { status: response.status }, category: 'menu' };
  }, { category: 'menu' });

  await reporter.record('Menu create rejects customer role', async () => {
    const response = await client.post('/menu', {
      name: 'Smoke Menu Item',
      description: 'Should be forbidden',
      price: 1.99,
      category: 'test',
    }, { token: state.customerToken });
    expectStatus(response, [403], 'menu create customer');
    expectErrorEnvelope(response, 'menu create customer');
    return { details: { status: response.status }, category: 'menu' };
  }, { category: 'menu' });

  await reporter.record('Cart rejects anonymous calls', async () => {
    const response = await client.get('/cart');
    expectUnauthorizedShape(response, 'cart anonymous');
    return { details: { status: response.status }, category: 'cart' };
  }, { category: 'cart' });

  await reporter.record('Cart validates missing payload', async () => {
    const response = await client.post('/cart', {}, { token: state.customerToken });
    expectStatus(response, [400, 422], 'cart validation');
    expectErrorEnvelope(response, 'cart validation');
    return { details: { status: response.status }, category: 'cart' };
  }, { category: 'cart' });

  await reporter.record('Cart add item succeeds', async () => {
    const response = await client.post('/cart', {
      productId: `SMOKE-PRODUCT-${randomSuffix()}`,
      quantity: 1,
      price: 3.99,
      productName: 'Smoke Test Product',
      imageUrl: 'https://example.com/smoke.png',
      available: true,
    }, { token: state.customerToken });
    expectStatus(response, [201], 'cart add');
    expectSuccessEnvelope(response, 'cart add');
    return { details: { status: response.status }, category: 'cart' };
  }, { category: 'cart' });

  await reporter.record('Cart get succeeds after add', async () => {
    const response = await client.get('/cart', { token: state.customerToken });
    expectStatus(response, [200], 'cart get');
    expectSuccessEnvelope(response, 'cart get');
    return { details: { status: response.status }, category: 'cart' };
  }, { category: 'cart' });

  await reporter.record('Profile rejects anonymous calls', async () => {
    const response = await client.get('/users/profile');
    expectUnauthorizedShape(response, 'profile anonymous');
    return { details: { status: response.status }, category: 'profile' };
  }, { category: 'profile' });

  await reporter.record('Profile get succeeds with JWT', async () => {
    const response = await client.get('/users/profile', { token: state.customerToken });
    expectStatus(response, [200], 'profile get');
    expectSuccessEnvelope(response, 'profile get');
    return { details: { status: response.status }, category: 'profile' };
  }, { category: 'profile' });

  await reporter.record('Profile update validates payload', async () => {
    const response = await client.put('/users/profile', {}, { token: state.customerToken });
    expectStatus(response, [400, 422], 'profile validation');
    expectErrorEnvelope(response, 'profile validation');
    return { details: { status: response.status }, category: 'profile' };
  }, { category: 'profile' });

  await reporter.record('Profile update succeeds', async () => {
    const response = await client.put('/users/profile', {
      name: 'FreshMart Smoke Tester',
      email: state.customerEmail,
      phone: '+6512345678',
    }, { token: state.customerToken });
    expectStatus(response, [200], 'profile update');
    expectSuccessEnvelope(response, 'profile update');
    return { details: { status: response.status }, category: 'profile' };
  }, { category: 'profile' });

  await reporter.record('Address add succeeds', async () => {
    const response = await client.post('/users/addresses', {
      label: 'Home',
      name: 'FreshMart Smoke Tester',
      phone: '+6512345678',
      line1: '1 Smoke Street',
      city: 'Singapore',
      state: 'Singapore',
      postalCode: '018989',
      isDefault: true,
    }, { token: state.customerToken });
    expectStatus(response, [201], 'address add');
    expectSuccessEnvelope(response, 'address add');
    return { details: { status: response.status }, category: 'profile' };
  }, { category: 'profile' });

  await reporter.record('Orders reject anonymous calls', async () => {
    const response = await client.post('/orders', {});
    expectUnauthorizedShape(response, 'orders anonymous');
    return { details: { status: response.status }, category: 'orders' };
  }, { category: 'orders' });

  await reporter.record('Orders validate cart/inventory constraints', async () => {
    const response = await client.post('/orders', {}, { token: state.customerToken });
    expectStatus(response, [400], 'orders validation');
    expectErrorEnvelope(response, 'orders validation');
    return { details: { status: response.status }, category: 'orders' };
  }, { category: 'orders' });

  await reporter.record('Payments reject anonymous calls', async () => {
    const response = await client.post('/payments', { orderId: 'missing', paymentMethod: 'CARD' });
    expectUnauthorizedShape(response, 'payments anonymous');
    return { details: { status: response.status }, category: 'payments' };
  }, { category: 'payments' });

  await reporter.record('Payments reject missing orders', async () => {
    const response = await client.post('/payments', { orderId: `ORDER-${randomSuffix()}`, paymentMethod: 'CARD' }, { token: state.customerToken });
    expectStatus(response, [404], 'payments missing order');
    expectErrorEnvelope(response, 'payments missing order');
    return { details: { status: response.status }, category: 'payments' };
  }, { category: 'payments' });

  await reporter.record('Inventory rejects customer role', async () => {
    const response = await client.get('/inventory', { token: state.customerToken });
    expectStatus(response, [403], 'inventory customer');
    expectErrorEnvelope(response, 'inventory customer');
    return { details: { status: response.status }, category: 'inventory' };
  }, { category: 'inventory' });

  await reporter.record('Admin routes reject customer role', async () => {
    const response = await client.get('/admin/dashboard', { token: state.customerToken });
    expectStatus(response, [403], 'admin customer');
    expectErrorEnvelope(response, 'admin customer');
    return { details: { status: response.status }, category: 'admin' };
  }, { category: 'admin' });

  await reporter.record('Admin login (optional)', async () => {
    state.adminToken = await loginWithAdmin(client);
    if (!state.adminToken) {
      return {
        status: 'skip',
        details: { reason: 'SMOKE_ADMIN_ACCESS_TOKEN or SMOKE_ADMIN_EMAIL/SMOKE_ADMIN_PASSWORD not provided' },
      };
    }
    return { details: { authenticated: true }, category: 'admin' };
  }, { category: 'admin', optional: true });

  if (state.adminToken) {
    await reporter.record('Admin health succeeds', async () => {
      const response = await client.get('/admin/health', { token: state.adminToken });
      expectStatus(response, [200], 'admin health');
      expectSuccessEnvelope(response, 'admin health');
      return { details: { status: response.status }, category: 'admin' };
    }, { category: 'admin' });

    await reporter.record('Inventory list succeeds for admin', async () => {
      const response = await client.get('/inventory', { token: state.adminToken });
      expectStatus(response, [200], 'inventory admin');
      expectSuccessEnvelope(response, 'inventory admin');
      return { details: { status: response.status }, category: 'inventory' };
    }, { category: 'inventory' });
  }

  await reporter.record('Logout succeeds', async () => {
    const response = await client.post('/auth/logout', { refreshToken: state.refreshToken }, { token: state.customerToken });
    expectStatus(response, [200], 'logout');
    expectSuccessEnvelope(response, 'logout');
    return { details: { status: response.status }, category: 'auth' };
  }, { category: 'auth' });

  const failures = reporter.checks.filter((check) => check.status === 'fail').length;
  const skips = reporter.checks.filter((check) => check.status === 'skip').length;
  const summary = {
    generatedAt: new Date().toISOString(),
    apiBaseUrl: baseUrl,
    region: AWS_REGION,
    checks: reporter.checks,
    totals: {
      pass: reporter.checks.filter((check) => check.status === 'pass').length,
      fail: failures,
      skip: skips,
    },
  };

  ensureDir(REPORT_PATH);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));

  if (failures > 0 || (FAIL_ON_SKIPS && skips > 0)) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(JSON.stringify({
    generatedAt: new Date().toISOString(),
    fatal: true,
    message: error instanceof Error ? error.message : String(error),
  }, null, 2));
  process.exitCode = 1;
});
