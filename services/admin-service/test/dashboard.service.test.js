const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_ADMIN = 'admin';
process.env.DDB_TABLE_PRODUCTS = 'products';
process.env.DDB_TABLE_INVENTORY = 'inventory';
process.env.DDB_TABLE_ORDERS = 'orders';
process.env.DDB_TABLE_USER_PROFILES = 'users';

const { buildDashboardResponse } = require('../src/services/admin.service');

test('dashboard response preserves event counters and overlays live statistics', () => {
  const result = buildDashboardResponse(
    {
      adminItemId: 'CURRENT',
      entityType: 'DASHBOARD',
      data: { notificationsSent: 9, totalOrders: 999, lowStockEvents: 999 },
      status: 'ACTIVE',
      version: 3,
    },
    {
      totalProducts: 12,
      totalCustomers: 5,
      totalOrders: 7,
      pendingOrders: 2,
      processingOrders: 1,
      completedOrders: 3,
      cancelledOrders: 1,
      totalRevenue: 145,
      failedPayments: 1,
      lowStockCount: 2,
      outOfStockCount: 1,
      recentOrders: [],
      inventoryAlerts: [],
      topSellingProducts: [],
    },
    '2026-07-19T10:00:00.000Z'
  );

  assert.equal(result.data.notificationsSent, 9);
  assert.equal(result.data.totalOrders, 7);
  assert.equal(result.data.lowStockEvents, 3);
  assert.equal(result.data.totalProducts, 12);
  assert.equal(result.data.lastUpdatedAt, '2026-07-19T10:00:00.000Z');
  assert.equal(result.version, 3);
});
