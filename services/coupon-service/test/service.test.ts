import test from 'node:test';
import assert from 'node:assert';
import { CouponService } from '../src/services/index.js';
import type { DynamoCouponRepository } from '../src/repositories/index.js';
import type { Coupon } from '../src/entities/index.js';

// Mock repository
const mockCoupons: Coupon[] = [];

const mockRepo = {
  getByCode: async (code: string) => mockCoupons.find(c => c.code === code) || null,
  getById: async (id: string) => mockCoupons.find(c => c.couponId === id) || null,
  save: async (c: Coupon) => {
    const idx = mockCoupons.findIndex(x => x.couponId === c.couponId);
    if (idx >= 0) mockCoupons[idx] = c;
    else mockCoupons.push(c);
    return c;
  },
  incrementUsage: async (id: string, customerId?: string, limit?: number) => {
    const c = mockCoupons.find(x => x.couponId === id);
    if (!c) throw new Error('Not found');
    if (limit && c.currentUsage >= limit) throw { name: 'ConditionalCheckFailedException' };
    c.currentUsage++;
  }
} as unknown as DynamoCouponRepository;

test('CouponService', async (t) => {
  const service = new CouponService(mockRepo);

  await t.test('create coupon', async () => {
    const coupon = await service.upsert({
      code: 'TEST20',
      title: 'Test',
      description: 'Test coupon',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      usageLimit: 2,
    });
    assert.strictEqual(coupon.code, 'TEST20');
    assert.strictEqual(coupon.currentUsage, 0);
  });

  await t.test('validate coupon success', async () => {
    const result = await service.validate({
      code: 'TEST20',
      customerId: 'user1',
      orderValue: 100,
      cartItems: []
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.discountAmount, 20);
    assert.strictEqual(result.finalOrderValue, 80);
  });

  await t.test('redeem coupon increments usage', async () => {
    await service.redeem({ code: 'TEST20', customerId: 'user1', orderId: 'ord1' });
    const coupon = await service.getByCode('TEST20');
    assert.strictEqual(coupon.currentUsage, 1);
  });

  await t.test('redeem coupon fails if limit reached', async () => {
    await service.redeem({ code: 'TEST20', customerId: 'user2', orderId: 'ord2' });
    // limit is 2, usage is now 2
    try {
      await service.redeem({ code: 'TEST20', customerId: 'user3', orderId: 'ord3' });
      assert.fail('Should have thrown limit reached');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      assert.match(err.message, /Coupon usage limit reached/);
    }
  });
});
