import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryPromotionsRepository } from '../src/repositories/index.js';
import { PromotionsService } from '../src/services/index.js';

test('promotions service stores active promotions', async () => {
  const service = new PromotionsService(new InMemoryPromotionsRepository());
  const promotion = await service.upsert({
    code: 'WELCOME10',
    title: 'Welcome Offer',
    description: 'Discount for first order',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2026-12-31T23:59:59.000Z',
    isActive: true
  });
  assert.equal(promotion.code, 'WELCOME10');
});
