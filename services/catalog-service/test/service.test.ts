import assert from 'node:assert/strict';
import test from 'node:test';
import { CatalogService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('catalog service persists and reads product records', async () => {
  const service = new CatalogService(new InMemoryRepository());
  const created = await service.upsert({
    name: 'Fresh Almond Milk',
    slug: 'fresh-almond-milk',
    brand: 'FreshMart Select',
    sku: 'ALMOND-MILK-1L',
    categoryId: 'beverages',
    description: 'Unsweetened almond milk with a clean ingredient list.',
    specifications: { volume: '1L', diet: 'vegan' },
    images: ['https://assets.freshmart.example/products/almond-milk.png'],
    variants: [{ name: '1 Litre', sku: 'ALMOND-MILK-1L', price: 199, currency: 'INR', attributes: { size: '1L' } }],
    rating: 4.5,
    availability: 'IN_STOCK',
    inventoryReference: 'ALMOND-MILK-1L'
  });
  const loaded = await service.getById(created.productId);
  assert.deepEqual(loaded, created);
});
