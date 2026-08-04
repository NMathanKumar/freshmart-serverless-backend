import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryWishlistRepository } from '../src/repositories/index.js';
import { WishlistService } from '../src/services/index.js';

test('wishlist service stores and returns customer wishlist items', async () => {
  const service = new WishlistService(new InMemoryWishlistRepository());
  await service.add({
    customerId: 'customer-1',
    productId: 'prod-1',
    sku: 'BANANA-1KG',
    productName: 'Organic Banana'
  });

  const items = await service.listByCustomer('customer-1');
  assert.equal(items.length, 1);
});
