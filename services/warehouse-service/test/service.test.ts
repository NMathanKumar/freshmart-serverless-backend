import assert from 'node:assert/strict';
import test from 'node:test';
import { warehouseSchema } from '../src/validators/index.js';

test('warehouse schema validates correctly', async () => {
  const result = warehouseSchema.safeParse({
    warehouseCode: 'WH-1',
    warehouseName: 'Main Warehouse',
    status: 'ACTIVE'
  });
  assert.equal(result.success, true);
});
