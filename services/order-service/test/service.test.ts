import assert from 'node:assert/strict';
import test from 'node:test';
import { OrderService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('order service persists and reads order records', async () => {
  const service = new OrderService(new InMemoryRepository());
  const created = await service.upsert({
    customerId: 'customer-1',
    status: 'CREATED',
    items: [{ sku: 'BANANA-1KG', productId: 'prod-1', quantity: 2, unitPrice: 45 }],
    currency: 'INR',
    subtotal: 90,
    deliveryFee: 25,
    discountAmount: 10,
    totalAmount: 105
  });
  const loaded = await service.getById(created.orderId);
  assert.deepEqual(loaded, created);
});
