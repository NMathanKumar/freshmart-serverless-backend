const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_USER_PROFILES = 'users';
process.env.DDB_TABLE_ORDERS = 'orders';

const { middleware } = require('@freshmart/service-shared');
const { createAdminCustomerRepository, VALID_STATUSES } = require('../src/repositories/admin-customer.repository');
const { createAdminCustomerService, ALLOWED_TRANSITIONS } = require('../src/services/admin-customer.service');
const adminCustomerRouter = require('../src/routes/admin-customer.routes');
const {
  adminCustomerListSchema,
  adminCustomerStatusSchema,
} = require('../src/validators/user.validator');

const tables = { orders: 'orders', userProfiles: 'users' };

// Fixed dates: USER-3 registered today so it counts as "new"
const now = new Date().toISOString();
const profiles = [
  {
    userId: 'USER-1', name: 'Ada Lovelace', email: 'ada@example.com', phone: '123', status: 'ACTIVE',
    address: { line1: '1 Computing Lane', isDefault: true },
    createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-10T08:00:00.000Z',
  },
  {
    userId: 'USER-2', name: 'Grace Hopper', email: 'grace@example.com', phone: '456', status: 'BLOCKED',
    addresses: [{ line1: '2 Compiler Road', isDefault: true }],
    createdAt: '2024-02-01T08:00:00.000Z', updatedAt: '2024-02-01T08:00:00.000Z',
  },
  {
    userId: 'USER-3', name: 'Katherine Johnson', email: 'katherine@example.com', status: 'INACTIVE',
    createdAt: now, updatedAt: now,
  },
];
const orders = [
  { orderId: 'ORDER-1', userId: 'USER-1', orderStatus: 'DELIVERED', paymentStatus: 'SUCCESS', totalAmount: 25, createdAt: '2024-03-18T10:00:00.000Z' },
  { orderId: 'ORDER-2', userId: 'USER-1', orderStatus: 'PLACED', paymentStatus: 'PENDING', totalAmount: 99, createdAt: '2024-03-19T10:00:00.000Z' },
  { orderId: 'ORDER-3', userId: 'USER-2', orderStatus: 'DELIVERED', paymentStatus: 'SUCCESS', totalAmount: '40.5', createdAt: '2024-03-17T10:00:00.000Z' },
  { orderId: 'ORDER-4', userId: 'USER-1', orderStatus: 'CANCELLED', paymentStatus: 'PENDING', totalAmount: 10, createdAt: '2024-03-20T10:00:00.000Z' },
];

const createRepositoryClient = ({ updateResult } = {}) => ({
  send: async (command) => {
    const input = command.input;
    const name = command.constructor.name;

    if (name === 'UpdateCommand') {
      if (updateResult === 'notFound') return { Attributes: null };
      const customerId = input.Key.pk.replace('USER#', '');
      const profile = profiles.find((p) => p.userId === customerId);
      if (!profile) return { Attributes: null };
      return { Attributes: { ...profile, status: input.ExpressionAttributeValues[':status'], updatedAt: input.ExpressionAttributeValues[':updatedAt'] } };
    }

    if (input.TableName === 'users') {
      if (name === 'GetCommand') {
        const customerId = input.Key.pk.replace('USER#', '');
        return { Item: profiles.find((p) => p.userId === customerId) };
      }
      return { Items: profiles };
    }
    if (input.IndexName === 'gsi1') {
      const customerId = input.ExpressionAttributeValues[':pk'].replace('USER#', '');
      return { Items: orders.filter((o) => o.userId === customerId) };
    }
    const status = input.ExpressionAttributeValues[':pk'].replace('STATUS#', '');
    return { Items: orders.filter((o) => o.orderStatus === status) };
  },
});

// ── 1. Pagination and sorting ────────────────────────────────────────────────
test('repository paginates and sorts by totalSpending descending', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const result = await repo.list({ page: 1, pageSize: 2, sortBy: 'totalSpending', sortOrder: 'desc' });

  assert.equal(result.total, 3);
  assert.equal(result.items.length, 2);
  assert.deepEqual(result.items.map((c) => c.customerId), ['USER-2', 'USER-1']);
  assert.equal(result.items[0].totalSpending, 40.5);
  assert.equal(result.items[1].totalSpending, 25);
  assert.equal(result.items[1].orderCount, 3);
  assert.equal(result.items[1].lastOrderDate, '2024-03-20T10:00:00.000Z');
});

// ── 2. Search filter ─────────────────────────────────────────────────────────
test('repository filters by search term across name, email, phone', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const byName = await repo.list({ search: 'grace' });
  assert.equal(byName.total, 1);
  assert.equal(byName.items[0].customerId, 'USER-2');

  const byEmail = await repo.list({ search: 'katherine@example' });
  assert.equal(byEmail.total, 1);
  assert.equal(byEmail.items[0].customerId, 'USER-3');
});

// ── 3. Status filter ─────────────────────────────────────────────────────────
test('repository filters by status', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const blocked = await repo.list({ status: 'BLOCKED' });
  assert.equal(blocked.total, 1);
  assert.equal(blocked.items[0].customerId, 'USER-2');

  const inactive = await repo.list({ status: 'INACTIVE' });
  assert.equal(inactive.total, 1);
  assert.equal(inactive.items[0].customerId, 'USER-3');
});

// ── 4. Summary fields ────────────────────────────────────────────────────────
test('repository summary includes totalCustomers, activeCustomers, inactiveCustomers, newCustomers', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const result = await repo.list({});

  assert.equal(result.summary.totalCustomers, 3);
  assert.equal(result.summary.activeCustomers, 1);
  assert.equal(result.summary.inactiveCustomers, 1);
  // USER-3 registered "now" so counts as new
  assert.equal(result.summary.newCustomers, 1);
});

// ── 5. Customer detail enrichment ────────────────────────────────────────────
test('repository findById returns statistics, orderSummary, and recentOrders', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const customer = await repo.findById('USER-1');

  assert.ok(customer);
  assert.equal(customer.orderCount, 3);
  assert.equal(customer.totalSpending, 25);
  assert.equal(customer.status, 'ACTIVE');

  assert.ok(customer.statistics);
  assert.equal(customer.statistics.orderCount, 3);
  assert.equal(customer.statistics.paidOrderCount, 1);
  assert.equal(customer.statistics.totalSpending, 25);

  assert.ok(customer.orderSummary);
  assert.equal(customer.orderSummary.total, 3);
  assert.equal(customer.orderSummary.paid, 1);
  assert.equal(customer.orderSummary.pending, 2);
  assert.equal(customer.orderSummary.cancelled, 1);

  assert.ok(Array.isArray(customer.recentOrders));
  assert.ok(customer.recentOrders.length <= 5);
  assert.ok(customer.recentOrders[0].orderId);
});

// ── 6. Default address resolution ────────────────────────────────────────────
test('repository resolves defaultAddress from address and addresses fields', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const user1 = await repo.findById('USER-1');
  assert.deepEqual(user1.defaultAddress, { line1: '1 Computing Lane', isDefault: true });

  const user2 = await repo.findById('USER-2');
  assert.deepEqual(user2.defaultAddress, { line1: '2 Compiler Road', isDefault: true });
});

// ── 7. Service pagination metadata ───────────────────────────────────────────
test('service returns correct pagination metadata including pageSize', async () => {
  const service = createAdminCustomerService({
    repository: {
      list: async () => ({ items: [], page: 2, pageSize: 10, total: 25, summary: { totalCustomers: 25, activeCustomers: 10, inactiveCustomers: 5, newCustomers: 3 } }),
      findById: async () => null,
      updateStatus: async () => null,
    },
  });
  const result = await service.listCustomers({});
  assert.equal(result.meta.page, 2);
  assert.equal(result.meta.pageSize, 10);
  assert.equal(result.meta.total, 25);
  assert.equal(result.meta.totalPages, 3);
  assert.equal(result.meta.summary.totalCustomers, 25);
  assert.equal(result.meta.summary.inactiveCustomers, 5);
  assert.equal(result.meta.summary.newCustomers, 3);
});

// ── 8. Not found ─────────────────────────────────────────────────────────────
test('service throws 404 for missing customer on getCustomer and updateStatus', async () => {
  const service = createAdminCustomerService({
    repository: { findById: async () => null, updateStatus: async () => null },
  });
  await assert.rejects(() => service.getCustomer('MISSING'), (e) => e.statusCode === 404);
  await assert.rejects(() => service.updateStatus('MISSING', 'ACTIVE'), (e) => e.statusCode === 404);
});

// ── 9. Status update persists ────────────────────────────────────────────────
test('service updateStatus persists new status and returns updated customer', async () => {
  const repo = createAdminCustomerRepository({ client: createRepositoryClient(), tables });
  const service = createAdminCustomerService({ repository: repo });

  const updated = await service.updateStatus('USER-1', 'INACTIVE');
  assert.equal(updated.status, 'INACTIVE');
  assert.ok(updated.updatedAt);
});

// ── 10. Invalid transition rejected with 409 ─────────────────────────────────
test('service rejects invalid status transitions with 409 ConflictError', async () => {
  // ACTIVE -> ACTIVE is not a valid transition
  const service = createAdminCustomerService({
    repository: {
      findById: async () => ({ customerId: 'USER-1', status: 'ACTIVE', orderCount: 0, totalSpending: 0, lastOrderDate: null }),
      updateStatus: async () => null,
    },
  });
  await assert.rejects(
    () => service.updateStatus('USER-1', 'ACTIVE'),
    (e) => {
      assert.equal(e.statusCode, 409);
      assert.equal(e.errorCode, 'CONFLICT');
      return true;
    }
  );
});

// ── 11. Authorization ────────────────────────────────────────────────────────
test('routes are admin-only and expose exactly three operations', () => {
  const routePaths = adminCustomerRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

  assert.deepEqual(routePaths, [
    { path: '/', methods: ['get'] },
    { path: '/:customerId', methods: ['get'] },
    { path: '/:customerId/status', methods: ['patch'] },
  ]);

  let called = false;
  middleware.authorize('ADMIN')({ user: { role: 'ADMIN' } }, {}, () => { called = true; });
  assert.equal(called, true);

  assert.throws(
    () => middleware.authorize('ADMIN')({ user: { role: 'CUSTOMER' } }, {}, () => {}),
    (e) => e.statusCode === 403
  );
});

// ── 12. Validation ───────────────────────────────────────────────────────────
test('validators reject unsupported sortBy, invalid status, and missing required fields', () => {
  assert.ok(adminCustomerListSchema.validate({ sortBy: 'membership' }).error);
  assert.ok(adminCustomerStatusSchema.validate({ status: 'SUSPENDED' }).error);
  assert.ok(adminCustomerStatusSchema.validate({}).error);

  const { error } = adminCustomerStatusSchema.validate({ status: 'INACTIVE' });
  assert.equal(error, undefined);

  const validateStatus = middleware.validate(adminCustomerStatusSchema);
  assert.throws(
    () => validateStatus({ body: { status: 'DELETED' }, method: 'PATCH' }, {}, () => {}),
    (e) => e.statusCode === 422 && e.errorCode === 'VALIDATION_ERROR'
  );
});

// ── 13. VALID_STATUSES and ALLOWED_TRANSITIONS exports ───────────────────────
test('VALID_STATUSES includes ACTIVE, INACTIVE, BLOCKED and transitions are correct', () => {
  assert.deepEqual(VALID_STATUSES, ['ACTIVE', 'INACTIVE', 'BLOCKED']);
  assert.ok(ALLOWED_TRANSITIONS['ACTIVE'].includes('INACTIVE'));
  assert.ok(ALLOWED_TRANSITIONS['ACTIVE'].includes('BLOCKED'));
  assert.ok(!ALLOWED_TRANSITIONS['ACTIVE'].includes('ACTIVE'));
  assert.ok(ALLOWED_TRANSITIONS['BLOCKED'].includes('ACTIVE'));
  assert.ok(ALLOWED_TRANSITIONS['INACTIVE'].includes('ACTIVE'));
});
