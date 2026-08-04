import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('inventory service persists and reads inventory item records', async () => {
  const service = new InventoryService(new InMemoryRepository());
  const created = await service.upsert({
    sku: 'BANANA-1KG',
    availableStock: 120,
    reservedStock: 15,
    soldStock: 220,
    restockThreshold: 25,
    warehouse: 'blr-warehouse-1'
  });
  const loaded = await service.getById(created.sku);
  assert.deepEqual(loaded, created);
});
