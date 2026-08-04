import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemorySearchRepository } from '../src/repositories/index.js';
import { SearchService } from '../src/services/index.js';

test('search service indexes and returns documents', async () => {
  const service = new SearchService(new InMemorySearchRepository());
  await service.upsert({
    documentType: 'product',
    title: 'Organic Banana',
    slug: 'organic-banana',
    searchTerm: 'banana',
    score: 100
  });
  const results = await service.search('banana');
  assert.equal(results.length, 1);
});
