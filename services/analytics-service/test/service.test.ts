import assert from 'node:assert/strict';
import test from 'node:test';
import { AnalyticsService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('analytics service persists and reads analytics snapshot records', async () => {
  const service = new AnalyticsService(new InMemoryRepository());
  const created = await service.upsert({
    dateKey: '2026-07-15',
    revenue: 145000,
    sales: 1130,
    customers: 682,
    orders: 597,
    peakHours: ['08:00', '20:00'],
    topProducts: [{ productId: 'prod-1', name: 'Organic Banana', unitsSold: 221, revenue: 9945 }]
  });
  const loaded = await service.getById(created.snapshotId);
  assert.deepEqual(loaded, created);
});
