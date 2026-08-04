const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_ADMIN = 'admin';
process.env.DDB_TABLE_PRODUCTS = 'products';
process.env.DDB_TABLE_INVENTORY = 'inventory';
process.env.DDB_TABLE_ORDERS = 'orders';
process.env.DDB_TABLE_USER_PROFILES = 'users';

const { createSupplierService } = require('../src/services/supplier.service');
const { supplierIdSchema, supplierListSchema, createSupplierSchema, updateSupplierSchema } = require('../src/validators/supplier.validator');

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

test('supplier service creates and retrieves a supplier', async () => {
  const repo = makeRepo();
  const svc = createSupplierService({ repository: repo });
  const created = await svc.create({ name: 'Fresh Farms', email: 'contact@freshfarms.com', status: 'ACTIVE' }, 'admin');
  assert.ok(created.adminItemId.startsWith('SUP_'));
  assert.equal(created.data.name, 'Fresh Farms');

  const fetched = await svc.getById(created.adminItemId);
  assert.equal(fetched.adminItemId, created.adminItemId);
});

test('supplier service getById throws NotFoundError for unknown id', async () => {
  const svc = createSupplierService({ repository: makeRepo() });
  await assert.rejects(() => svc.getById('SUP_nonexistent'), { errorCode: 'NOT_FOUND' });
});

test('supplier service update merges fields', async () => {
  const repo = makeRepo();
  const svc = createSupplierService({ repository: repo });
  const created = await svc.create({ name: 'Fresh Farms', email: 'contact@freshfarms.com' }, 'admin');
  const updated = await svc.update(created.adminItemId, { name: 'Fresh Farms Ltd' });
  assert.equal(updated.data.name, 'Fresh Farms Ltd');
  assert.equal(updated.data.email, 'contact@freshfarms.com');
});

test('supplier service remove deletes the item', async () => {
  const repo = makeRepo();
  const svc = createSupplierService({ repository: repo });
  const created = await svc.create({ name: 'Dairy Co', email: 'contact@dairy.com' }, 'admin');
  await svc.remove(created.adminItemId);
  await assert.rejects(() => svc.getById(created.adminItemId), { errorCode: 'NOT_FOUND' });
});

test('supplier service list paginates results', async () => {
  const repo = makeRepo();
  const svc = createSupplierService({ repository: repo });
  for (let i = 0; i < 5; i++) await svc.create({ name: `Supplier ${i}`, email: `s${i}@test.com` }, 'admin');

  const page1 = await svc.list({ page: 1, limit: 3 });
  assert.equal(page1.items.length, 3);
  assert.equal(page1.total, 5);
  assert.equal(page1.totalPages, 2);

  const page2 = await svc.list({ page: 2, limit: 3 });
  assert.equal(page2.items.length, 2);
});

test('supplier service list filters by search', async () => {
  const repo = makeRepo();
  const svc = createSupplierService({ repository: repo });
  await svc.create({ name: 'Fresh Farms', email: 'contact@freshfarms.com' }, 'admin');
  await svc.create({ name: 'Veggie Corp', email: 'contact@veggie.com' }, 'admin');

  const result = await svc.list({ search: 'fresh' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].data.name, 'Fresh Farms');
});

test('supplier service list filters by status', async () => {
  const repo = makeRepo();
  const svc = createSupplierService({ repository: repo });
  await svc.create({ name: 'Active Supplier', email: 'a@test.com', status: 'ACTIVE' }, 'admin');
  await svc.create({ name: 'Inactive Supplier', email: 'i@test.com', status: 'INACTIVE' }, 'admin');

  const result = await svc.list({ status: 'ACTIVE' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].data.name, 'Active Supplier');
});

test('createSupplierSchema requires name and email', () => {
  const { error } = createSupplierSchema.validate({}, { abortEarly: false });
  assert.ok(error);
  const fields = error.details.map((d) => d.path[0]);
  assert.ok(fields.includes('name'));
  assert.ok(fields.includes('email'));
});

test('createSupplierSchema rejects invalid email', () => {
  const { error } = createSupplierSchema.validate({ name: 'Test', email: 'not-an-email' });
  assert.ok(error);
});

test('createSupplierSchema accepts valid payload', () => {
  const { error, value } = createSupplierSchema.validate({ name: 'Fresh Farms', email: 'contact@freshfarms.com', status: 'ACTIVE' });
  assert.equal(error, undefined);
  assert.equal(value.name, 'Fresh Farms');
});

test('updateSupplierSchema requires at least one field', () => {
  const { error } = updateSupplierSchema.validate({}, { abortEarly: false });
  assert.ok(error);
});

test('supplierListSchema applies defaults', () => {
  const { value } = supplierListSchema.validate({}, { abortEarly: false });
  assert.equal(value.page, 1);
  assert.equal(value.limit, 20);
  assert.equal(value.sortBy, 'createdAt');
  assert.equal(value.sortOrder, 'desc');
});

test('supplierIdSchema rejects empty id', () => {
  const { error } = supplierIdSchema.validate({ supplierId: '' });
  assert.ok(error);
});
