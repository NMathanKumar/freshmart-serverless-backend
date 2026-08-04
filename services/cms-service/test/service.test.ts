import assert from 'node:assert/strict';
import test from 'node:test';
import { CmsService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('cms service persists and reads page records', async () => {
  const service = new CmsService(new InMemoryRepository());
  const created = await service.upsert({
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: 'FreshMart privacy policy for customer and merchant data.',
    type: 'PRIVACY_POLICY',
    isPublished: true
  });
  const loaded = await service.getById(created.pageId);
  assert.deepEqual(loaded, created);
});
