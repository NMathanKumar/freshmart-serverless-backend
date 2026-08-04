const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_ADMIN = 'admin';
process.env.DDB_TABLE_PRODUCTS = 'products';
process.env.DDB_TABLE_INVENTORY = 'inventory';
process.env.DDB_TABLE_ORDERS = 'orders';
process.env.DDB_TABLE_USER_PROFILES = 'users';

const { createDeliveryService } = require('../src/services/delivery.service');
const { deliveryIdSchema, deliveryListSchema, deliveryStatusSchema, assignDriverSchema, cancelDeliverySchema } = require('../src/validators/delivery.validator');

const makeRepo = (items = []) => {
  const store = [...items];
  return {
    store,
    listByEntityType: async () => store,
    getEntity: async (type, id) => store.find((i) => i.adminItemId === id) || null,
    createEntity: async ({ entityType, itemId, data, status, createdBy }) => {
      const item = { adminItemId: itemId, entityType, data, status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy, version: 0 };
      store.push(item);
      return item;
    },
    saveEntity: async ({ entityType, itemId, data, status, createdBy }) => {
      const idx = store.findIndex((i) => i.adminItemId === itemId);
      const item = { adminItemId: itemId, entityType, data, status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy, version: (store[idx]?.version || 0) + 1 };
      if (idx >= 0) store[idx] = item; else store.push(item);
      return item;
    },
    deleteEntity: async (type, id) => {
      const idx = store.findIndex((i) => i.adminItemId === id);
      if (idx >= 0) store.splice(idx, 1);
      return true;
    },
  };
};

test('delivery service creates a delivery', async () => {
  const repo = makeRepo();
  const svc = createDeliveryService({ repository: repo });
  const created = await svc.create({ orderId: 'ORD_1', destination: 'Home' }, 'admin');
  assert.ok(created.adminItemId.startsWith('DEL_'));
  assert.equal(created.status, 'ASSIGNED');
  assert.ok(created.data.trackingNumber);
});

test('delivery service updateStatus allows ASSIGNED -> PACKED', async () => {
  const repo = makeRepo();
  const svc = createDeliveryService({ repository: repo });
  const created = await svc.create({ orderId: 'ORD_1' }, 'admin');
  const updated = await svc.updateStatus(created.adminItemId, { status: 'PACKED', note: 'Done' });
  assert.equal(updated.status, 'PACKED');
});

test('delivery service updateStatus rejects ASSIGNED -> DELIVERED', async () => {
  const repo = makeRepo();
  const svc = createDeliveryService({ repository: repo });
  const created = await svc.create({ orderId: 'ORD_1' }, 'admin');
  await assert.rejects(() => svc.updateStatus(created.adminItemId, { status: 'DELIVERED' }), { errorCode: 'CONFLICT' });
});

test('delivery service assignDriver updates driver info', async () => {
  const repo = makeRepo();
  const svc = createDeliveryService({ repository: repo });
  const created = await svc.create({ orderId: 'ORD_1' }, 'admin');
  const assigned = await svc.assignDriver(created.adminItemId, { driverId: 'DRV_1', driverName: 'John' });
  assert.equal(assigned.data.driverId, 'DRV_1');
  assert.equal(assigned.data.driverName, 'John');
});

test('delivery service cancel allows PACKED -> CANCELLED', async () => {
  const repo = makeRepo();
  const svc = createDeliveryService({ repository: repo });
  const created = await svc.create({ orderId: 'ORD_1' }, 'admin');
  await svc.updateStatus(created.adminItemId, { status: 'PACKED' });
  const cancelled = await svc.cancel(created.adminItemId, { reason: 'Customer requested' });
  assert.equal(cancelled.status, 'CANCELLED');
});

test('delivery service getStatistics returns correct counts', async () => {
  const repo = makeRepo();
  const svc = createDeliveryService({ repository: repo });
  await svc.create({ orderId: 'ORD_1' }, 'admin');
  const stats = await svc.getStatistics();
  assert.equal(stats.total, 1);
  assert.equal(stats.assigned, 1);
});

test('deliveryListSchema applies defaults', () => {
  const { value } = deliveryListSchema.validate({}, { abortEarly: false });
  assert.equal(value.page, 1);
  assert.equal(value.limit, 20);
});

test('deliveryStatusSchema requires status', () => {
  const { error } = deliveryStatusSchema.validate({}, { abortEarly: false });
  assert.ok(error);
});

test('assignDriverSchema requires driverId', () => {
  const { error } = assignDriverSchema.validate({}, { abortEarly: false });
  assert.ok(error);
});

test('deliveryIdSchema rejects empty id', () => {
  const { error } = deliveryIdSchema.validate({ deliveryId: '' });
  assert.ok(error);
});
