import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryBrandRepository } from '../src/repositories/index.js';
import { BrandService } from '../src/services/index.js';

test('brand service upserts brands', async () => {
  const service = new BrandService(new InMemoryBrandRepository());
  const brand = await service.upsert({ name: 'FreshMart Select', slug: 'freshmart-select', isActive: true });
  assert.equal(brand.slug, 'freshmart-select');
});
