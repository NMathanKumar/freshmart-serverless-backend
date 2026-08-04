import assert from 'node:assert/strict';
import test from 'node:test';
import { ReviewService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('review service manages reviews correctly', async () => {
  const service = new ReviewService(new InMemoryRepository());
  const created = await service.create({
    productId: 'prod-123',
    rating: 5,
    title: 'Great product',
    comment: 'I loved it'
  }, 'cust-456');

  assert.equal(created.status, 'PENDING');
  assert.equal(created.productId, 'prod-123');

  const loaded = await service.getById(created.reviewId);
  assert.deepEqual(loaded, created);

  const approved = await service.approve(created.reviewId, 'admin-1');
  assert.equal(approved.status, 'APPROVED');

  const rejected = await service.reject(created.reviewId, 'admin-2');
  assert.equal(rejected.status, 'REJECTED');

  await service.delete(created.reviewId);
  
  await assert.rejects(
    async () => service.getById(created.reviewId),
    { message: 'Review not found.' }
  );
});
