import assert from 'node:assert/strict';
import test from 'node:test';
import { CartService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('cart service persists and reads cart records', async () => {
  const service = new CartService(new InMemoryRepository());
  const created = await service.upsert({
    customerId: 'customer-1',
    items: [{ sku: 'BANANA-1KG', productId: 'prod-1', name: 'Organic Banana', quantity: 2, unitPrice: 45 }],
    couponCodes: ['WELCOME10']
  });
  const loaded = await service.getById(created.customerId);
  assert.deepEqual(loaded, created);
});
