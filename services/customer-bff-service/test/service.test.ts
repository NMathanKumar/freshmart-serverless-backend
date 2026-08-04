import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryAggregationCacheRepository } from '../src/repositories/index.js';
import { CustomerBffService, StaticCustomerGateway } from '../src/services/index.js';

test('customer bff caches the home page composition', async () => {
  const cache = new InMemoryAggregationCacheRepository();
  const service = new CustomerBffService(new StaticCustomerGateway(), cache);

  const first = await service.getHome('customer-1');
  const second = await service.getHome('customer-1');

  assert.deepEqual(first, second);
});