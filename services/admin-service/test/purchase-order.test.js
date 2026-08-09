const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_ADMIN = 'admin';
process.env.DDB_TABLE_PRODUCTS = 'products';
process.env.DDB_TABLE_INVENTORY = 'inventory';
process.env.DDB_TABLE_ORDERS = 'orders';
process.env.DDB_TABLE_USER_PROFILES = 'users';

const { createPurchaseOrderService, computeTotal, computeSubtotal } = require('../src/services/purchase-order.service');
const { purchaseOrderIdSchema, purchaseOrderListSchema, createPurchaseOrderSchema, updatePurchaseOrderSchema, receivePurchaseOrderSchema } = require('../src/validators/purchase-order.validator');

const makeRepo = (items = []) => {
  const store = [...items];
  let seq = 0;
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
    getNextSequence: async (seqName) => {
      seq += 1;
      return seq;
    }
  };
};

test('computeSubtotal calculates correctly', () => {
  const items = [
    { unitPrice: 10, quantityOrdered: 2 },
    { unitPrice: 5, quantityOrdered: 4 },
  ];
  assert.equal(computeSubtotal(items), 40);
});

test('computeTotal calculates correctly with tax and discount', () => {
  const data = {
    items: [
      { unitPrice: 10, quantityOrdered: 2 },
    ],
    tax: 5,
    shippingCost: 10,
    discount: 2,
  };
  assert.equal(computeTotal(data), 33); // 20 + 5 + 10 - 2
});

test('PO service creates and retrieves a PO', async () => {
  const repo = makeRepo();
  const svc = createPurchaseOrderService({ repository: repo });
  const created = await svc.create({ supplierId: 'SUP_1', items: [{ productId: 'PROD_1', quantityOrdered: 10, unitPrice: 5 }] }, 'admin');
  assert.ok(created.adminItemId.startsWith('PO'));
  assert.equal(created.status, 'DRAFT');
  assert.equal(created.data.totalAmount, 50);

  const fetched = await svc.getById(created.adminItemId);
  assert.equal(fetched.adminItemId, created.adminItemId);
});

test('PO service update allows edit in DRAFT', async () => {
  const repo = makeRepo();
  const svc = createPurchaseOrderService({ repository: repo });
  const created = await svc.create({ supplierId: 'SUP_1', items: [{ productId: 'PROD_1', quantityOrdered: 10, unitPrice: 5 }] }, 'admin');
  const updated = await svc.update(created.adminItemId, { items: [{ productId: 'PROD_1', quantityOrdered: 20, unitPrice: 5 }] });
  assert.equal(updated.data.totalAmount, 100);
});

test('PO service update rejects edit in ORDERED', async () => {
  const repo = makeRepo();
  const svc = createPurchaseOrderService({ repository: repo });
  const created = await svc.create({ supplierId: 'SUP_1', items: [] }, 'admin');
  await svc.updateStatus(created.adminItemId, 'SUBMITTED');
  await svc.updateStatus(created.adminItemId, 'APPROVED');
  await svc.updateStatus(created.adminItemId, 'ORDERED');
  await assert.rejects(() => svc.update(created.adminItemId, { notes: 'test' }), { errorCode: 'CONFLICT' });
});

test('PO service receive updates inventory and changes status', async () => {
  const repo = makeRepo();
  const inventoryCalls = [];
  const mockInventoryIncrease = async (productId, warehouseId, quantity) => {
    inventoryCalls.push({ productId, warehouseId, quantity });
    return { success: true };
  };

  const svc = createPurchaseOrderService({ repository: repo, inventoryIncrease: mockInventoryIncrease });
  const created = await svc.create({ supplierId: 'SUP_1', items: [{ productId: 'PROD_1', quantityOrdered: 10, unitPrice: 5 }] }, 'admin');
  await svc.updateStatus(created.adminItemId, 'SUBMITTED');
  await svc.updateStatus(created.adminItemId, 'APPROVED');
  await svc.updateStatus(created.adminItemId, 'ORDERED');

  const received = await svc.receive(created.adminItemId, { warehouseId: 'WH_MAIN', receivedItems: [{ productId: 'PROD_1', receivedQuantity: 10 }] });
  assert.equal(received.status, 'RECEIVED');
  assert.equal(inventoryCalls.length, 1);
  assert.equal(inventoryCalls[0].productId, 'PROD_1');
  assert.equal(inventoryCalls[0].quantity, 10);
});

test('PO service receive throws if not ORDERED', async () => {
  const repo = makeRepo();
  const svc = createPurchaseOrderService({ repository: repo });
  const created = await svc.create({ supplierId: 'SUP_1', items: [] }, 'admin');
  await assert.rejects(() => svc.receive(created.adminItemId, { warehouseId: 'WH_MAIN', receivedItems: [] }), { errorCode: 'CONFLICT' });
});

test('PO service cancel allows DRAFT to CANCELLED', async () => {
  const repo = makeRepo();
  const svc = createPurchaseOrderService({ repository: repo });
  const created = await svc.create({ supplierId: 'SUP_1', items: [] }, 'admin');
  const cancelled = await svc.cancel(created.adminItemId, { reason: 'No longer needed' });
  assert.equal(cancelled.status, 'CANCELLED');
});

test('PO service cancel throws if already RECEIVED', async () => {
  const repo = makeRepo();
  const mockInventoryIncrease = async () => ({ success: true });
  const svc = createPurchaseOrderService({ repository: repo, inventoryIncrease: mockInventoryIncrease });
  const created = await svc.create({ supplierId: 'SUP_1', items: [{ productId: 'P1', quantityOrdered: 10, unitPrice: 5 }] }, 'admin');
  await svc.updateStatus(created.adminItemId, 'SUBMITTED');
  await svc.updateStatus(created.adminItemId, 'APPROVED');
  await svc.updateStatus(created.adminItemId, 'ORDERED');
  await svc.receive(created.adminItemId, { warehouseId: 'WH_MAIN', receivedItems: [{ productId: 'P1', receivedQuantity: 10 }] });
  await assert.rejects(() => svc.cancel(created.adminItemId), { errorCode: 'CONFLICT' });
});

test('createPurchaseOrderSchema requires supplierId and items', () => {
  const { error } = createPurchaseOrderSchema.validate({}, { abortEarly: false });
  assert.ok(error);
  const fields = error.details.map((d) => d.path[0]);
  assert.ok(fields.includes('supplierId'));
  assert.ok(fields.includes('items'));
});

test('createPurchaseOrderSchema validates items correctly', () => {
  const { error } = createPurchaseOrderSchema.validate({ supplierId: 'S', items: [{ productId: 'P', quantityOrdered: 0, unitPrice: 5 }] });
  assert.ok(error); // quantity must be positive
});

test('createPurchaseOrderSchema accepts valid payload', () => {
  const { error, value } = createPurchaseOrderSchema.validate({ supplierId: 'S', items: [{ productId: 'P', quantityOrdered: 1, unitPrice: 5 }] });
  assert.equal(error, undefined);
  assert.equal(value.supplierId, 'S');
});

test('updatePurchaseOrderSchema requires at least one field', () => {
  const { error } = updatePurchaseOrderSchema.validate({}, { abortEarly: false });
  assert.ok(error);
});

test('receivePurchaseOrderSchema requires receivedItems', () => {
  const { error } = receivePurchaseOrderSchema.validate({}, { abortEarly: false });
  assert.ok(error);
});

test('purchaseOrderListSchema applies defaults', () => {
  const { value } = purchaseOrderListSchema.validate({}, { abortEarly: false });
  assert.equal(value.page, 1);
  assert.equal(value.limit, 20);
});

test('purchaseOrderIdSchema rejects empty id', () => {
  const { error } = purchaseOrderIdSchema.validate({ purchaseOrderId: '' });
  assert.ok(error);
});
