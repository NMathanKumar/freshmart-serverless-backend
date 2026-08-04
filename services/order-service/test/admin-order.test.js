const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_ORDERS = 'orders';
process.env.DDB_TABLE_USER_PROFILES = 'users';
process.env.DDB_TABLE_CARTS = 'carts';
process.env.DDB_TABLE_INVENTORY = 'inventory';
process.env.DDB_TABLE_PRODUCTS = 'products';

const { middleware } = require('@freshmart/service-shared');
const { createAdminOrderRepository } = require('../src/repositories/admin-order.repository');
const { createAdminOrderService } = require('../src/services/admin-order.service');
const adminOrderRouter = require('../src/routes/admin-order.routes');
const { adminOrderStatusSchema } = require('../src/validators/order.validator');

const tables = { orders: 'orders', userProfiles: 'users' };

const rawOrders = [
  {
    orderId: 'ORDER-1', userId: 'USER-1', orderStatus: 'PLACED', paymentStatus: 'PENDING',
    items: [{ productId: 'P1', quantity: 2, price: 5, imageUrl: 'one.jpg' }],
    subtotal: 10, tax: 1, discount: 0, totalAmount: 11,
    createdAt: '2026-07-18T10:00:00.000Z', updatedAt: '2026-07-18T10:00:00.000Z', version: 0,
  },
  {
    orderId: 'ORDER-2', userId: 'USER-2', orderStatus: 'DELIVERED', paymentStatus: 'SUCCESS',
    items: [{ productId: 'P2', quantity: 1, price: 20 }],
    subtotal: 20, tax: 2, discount: 0, totalAmount: 22,
    createdAt: '2026-07-19T10:00:00.000Z', updatedAt: '2026-07-19T11:00:00.000Z', version: 2,
  },
  {
    orderId: 'ORDER-3', userId: 'USER-1', orderStatus: 'ACCEPTED', paymentStatus: 'SUCCESS',
    items: [], subtotal: 30, tax: 3, discount: 0, totalAmount: 33,
    createdAt: '2026-07-17T10:00:00.000Z', updatedAt: '2026-07-17T11:00:00.000Z', version: 1,
  },
];

const createRepositoryClient = () => ({
  send: async (command) => {
    const input = command.input;
    if (input.TableName === 'users') {
      if (command.constructor.name === 'GetCommand') {
        return { Item: { userId: 'USER-1', name: 'Ada Lovelace', email: 'ada@example.com', phone: '123' } };
      }
      return { Items: [
        { userId: 'USER-1', name: 'Ada Lovelace', email: 'ada@example.com', phone: '123' },
        { userId: 'USER-2', name: 'Grace Hopper', email: 'grace@example.com', phone: '456' },
      ] };
    }
    
    if (input.ExpressionAttributeValues && input.ExpressionAttributeValues[':pk']) {
      const status = input.ExpressionAttributeValues[':pk'].replace('STATUS#', '');
      return { Items: rawOrders.filter((order) => order.orderStatus === status) };
    }
    
    return { Items: rawOrders };
  },
});

test('admin order repository supports pagination and sorting', async () => {
  const repository = createAdminOrderRepository({ client: createRepositoryClient(), tables });
  const result = await repository.list({ page: 2, limit: 1, sortBy: 'totalAmount', sortOrder: 'desc' });

  assert.equal(result.total, 3);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].orderId, 'ORDER-2');
  assert.equal(result.summary.totalOrders, 3);
  assert.equal(result.summary.revenue, 55);
});

test('admin order repository applies search, status, payment, and date filters', async () => {
  const repository = createAdminOrderRepository({ client: createRepositoryClient(), tables });
  const result = await repository.list({
    search: 'ada',
    status: 'PLACED',
    paymentStatus: 'PENDING',
    startDate: new Date('2026-07-18T00:00:00.000Z'),
    endDate: new Date('2026-07-18T00:00:00.000Z'),
  });

  assert.equal(result.total, 1);
  assert.equal(result.items[0].orderId, 'ORDER-1');
  assert.equal(result.items[0].customer.email, 'ada@example.com');
  assert.equal(result.items[0].itemsCount, 2);
  assert.equal(result.items[0].shippingAddress, null);
});

const baseOrder = { ...rawOrders[0] };
const createService = ({ current = baseOrder, operations: operationOverrides = {} } = {}) => {
  const calls = [];
  const operations = {
    ALLOWED_TRANSITIONS: {
      PLACED: ['ACCEPTED', 'CANCELLED'], ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'], READY: ['DELIVERED', 'CANCELLED'], DELIVERED: [], CANCELLED: [],
    },
    updateOrderStatus: async (_id, status) => { calls.push(`update:${status}`); return { ...current, orderStatus: status }; },
    cancelOrder: async () => { calls.push('cancel'); return { ...current, orderStatus: 'CANCELLED' }; },
    ...operationOverrides,
  };
  const service = createAdminOrderService({
    adminRepository: {
      findCustomerById: async () => ({ userId: 'USER-1', name: 'Ada Lovelace' }),
      list: async () => ({ items: [], page: 1, limit: 20, total: 0, summary: {} }),
    },
    orders: { findById: async () => current },
    operations,
  });
  return { calls, service };
};

test('admin order service applies a supported status transition', async () => {
  const { calls, service } = createService();
  const result = await service.updateStatus('ORDER-1', 'ACCEPTED');
  assert.equal(result.orderStatus, 'ACCEPTED');
  assert.deepEqual(calls, ['update:ACCEPTED']);
});

test('admin order service delegates cancellation to inventory-restoring order flow', async () => {
  const { calls, service } = createService();
  const result = await service.updateStatus('ORDER-1', 'CANCELLED');
  assert.equal(result.orderStatus, 'CANCELLED');
  assert.deepEqual(calls, ['cancel']);
});

test('admin order service rejects invalid transitions with conflict', async () => {
  const { service } = createService();
  await assert.rejects(() => service.updateStatus('ORDER-1', 'DELIVERED'), (error) => {
    assert.equal(error.statusCode, 409);
    assert.equal(error.errorCode, 'CONFLICT');
    return true;
  });
});

test('admin order service returns not found for missing orders', async () => {
  const { service } = createService({ current: null });
  await assert.rejects(() => service.getOrder('MISSING'), (error) => error.statusCode === 404);
  await assert.rejects(() => service.updateStatus('MISSING', 'ACCEPTED'), (error) => error.statusCode === 404);
});

test('admin order routes are admin-only and expose exactly three operations', () => {
  const routePaths = adminOrderRouter.stack.filter((layer) => layer.route).map((layer) => ({
    path: layer.route.path,
    methods: Object.keys(layer.route.methods),
  }));
  assert.deepEqual(routePaths, [
    { path: '/', methods: ['get'] },
    { path: '/:orderId', methods: ['get'] },
    { path: '/:orderId/status', methods: ['patch'] },
  ]);

  let nextCalled = false;
  middleware.authorize('ADMIN')({ user: { role: 'ADMIN' } }, {}, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.throws(
    () => middleware.authorize('ADMIN')({ user: { role: 'CUSTOMER' } }, {}, () => {}),
    (error) => error.statusCode === 403
  );
});

test('admin order status validation rejects unsupported values with 422', () => {
  const validateStatus = middleware.validate(adminOrderStatusSchema);
  assert.throws(
    () => validateStatus({ body: { orderStatus: 'OUT_FOR_DELIVERY' }, method: 'PATCH' }, {}, () => {}),
    (error) => error.statusCode === 422 && error.errorCode === 'VALIDATION_ERROR'
  );
});
