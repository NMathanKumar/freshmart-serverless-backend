const assert = require('node:assert/strict');
const test = require('node:test');
const { createDashboardRepository } = require('../src/repositories/dashboard.repository');

const tables = {
  products: 'products',
  inventory: 'inventory',
  orders: 'orders',
  userProfiles: 'users',
};

const createClient = (resolve) => ({
  send: async (command) => resolve(command.constructor.name, command.input),
});

test('dashboard repository aggregates existing operational tables', async () => {
  const requests = [];
  const client = createClient((commandName, input) => {
    requests.push({ commandName, input });
    if (input.TableName === 'products') {
      if (!input.ExclusiveStartKey) {
        return {
          Items: [{ productId: 'p1', productName: 'Bananas' }],
          LastEvaluatedKey: { PK: 'PRODUCT#p1', SK: 'LIST' },
        };
      }
      return { Items: [{ productId: 'p2', productName: 'Milk' }] };
    }
    if (input.TableName === 'users') {
      return { Items: [{ userId: 'u1', name: 'Ada' }, { userId: 'u2', name: 'Grace' }] };
    }
    if (input.TableName === 'inventory') {
      return {
        Items: [
          { productId: 'p1', currentStock: 4, minimumStock: 10, availableStock: 4, status: 'LOW_STOCK' },
          { productId: 'p2', currentStock: 0, minimumStock: 5, availableStock: 0, status: 'OUT_OF_STOCK' },
        ],
      };
    }
    if (input.TableName === 'orders') {
      return {
        Items: [
          { orderId: 'o1', userId: 'u1', orderStatus: 'PLACED', paymentStatus: 'PENDING', totalAmount: 20, items: [{ productId: 'p1', quantity: 1, price: 20 }], createdAt: '2026-01-01T00:00:00.000Z' },
          { orderId: 'o2', userId: 'u2', orderStatus: 'DELIVERED', paymentStatus: 'SUCCESS', totalAmount: 60, items: [{ productId: 'p1', productName: 'Bananas', quantity: 3, lineTotal: 60 }], createdAt: '2026-01-02T00:00:00.000Z' },
          { orderId: 'o3', userId: 'u1', orderStatus: 'CANCELLED', paymentStatus: 'FAILED', totalAmount: 30, items: [], createdAt: '2025-12-31T00:00:00.000Z' },
        ],
      };
    }
    throw new Error(`Unexpected table ${input.TableName}`);
  });

  const result = await createDashboardRepository({ client, tables }).getStatistics();

  assert.equal(result.totalProducts, 2);
  assert.equal(result.totalCustomers, 2);
  assert.equal(result.totalOrders, 3);
  assert.equal(result.pendingOrders, 1);
  assert.equal(result.completedOrders, 1);
  assert.equal(result.cancelledOrders, 1);
  assert.equal(result.totalRevenue, 110);
  assert.equal(result.failedPayments, 1);
  assert.equal(result.lowStockCount, 1);
  assert.equal(result.outOfStockCount, 1);
  assert.equal(result.recentOrders[0].orderId, 'o2');
  assert.equal(result.recentOrders[0].customerName, 'Grace');
  assert.equal(result.inventoryAlerts[0].productName, 'Milk');
  assert.deepEqual(result.topSellingProducts, [{ productId: 'p1', productName: 'Bananas', quantity: 3, revenue: 60 }]);
  assert.equal(requests.filter((request) => request.input.TableName === 'products').length, 2);
});

test('dashboard repository returns zeroed summaries for empty tables', async () => {
  const client = createClient(() => ({ Items: [] }));
  const result = await createDashboardRepository({ client, tables }).getStatistics();

  assert.equal(result.totalProducts, 0);
  assert.equal(result.totalCustomers, 0);
  assert.equal(result.totalOrders, 0);
  assert.equal(result.totalRevenue, 0);
  assert.deepEqual(result.recentOrders, []);
  assert.deepEqual(result.inventoryAlerts, []);
  assert.deepEqual(result.topSellingProducts, []);
});
