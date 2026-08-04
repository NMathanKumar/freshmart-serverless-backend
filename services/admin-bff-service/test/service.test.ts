import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryDashboardCacheRepository } from '../src/repositories/index.js';
import { AdminBffService, StaticAdminGateway } from '../src/services/index.js';

test('admin bff returns dashboard insight cards', async () => {
  const service = new AdminBffService(new StaticAdminGateway(), new InMemoryDashboardCacheRepository());
  const dashboard = await service.getDashboard();
  assert.equal(dashboard.pendingOrders >= 0, true);
});