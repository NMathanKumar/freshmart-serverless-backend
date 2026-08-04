import assert from 'node:assert/strict';
import test from 'node:test';
import { CategoryService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('category service persists and reads category records', async () => {
  const service = new CategoryService(new InMemoryRepository());
  const created = await service.upsert({
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    sortOrder: 4,
    isActive: true
  });
  const loaded = await service.getById(created.categoryId);
  assert.deepEqual(loaded, created);
});
