import { jsonResponse, validate } from '@freshmart/platform-core';
import {
  redeemCouponSchema,
  upsertCouponSchema,
  validateCouponSchema
} from '../validators/index.js';
import type { CouponService } from '../services/index.js';

export class CouponController {
  constructor(private readonly service: CouponService) {}

  async list() {
    const items = await this.service.list();
    return jsonResponse(200, { items });
  }

  async getById(couponId: string) {
    const item = await this.service.getById(couponId);
    return jsonResponse(200, item);
  }

  async getByCode(code: string) {
    const item = await this.service.getByCode(code);
    return jsonResponse(200, item);
  }

  async upsert(body: Record<string, unknown>, userId: string = 'system') {
    const input = validate(upsertCouponSchema, body);
    const item = await this.service.upsert(input, userId);
    return jsonResponse(200, item);
  }

  async validateCoupon(body: Record<string, unknown>) {
    const input = validate(validateCouponSchema, body);
    const result = await this.service.validate(input);
    return jsonResponse(200, result);
  }

  async redeemCoupon(body: Record<string, unknown>) {
    const input = validate(redeemCouponSchema, body);
    const result = await this.service.redeem(input);
    return jsonResponse(200, result);
  }
}

export const createController = (service: CouponService) => new CouponController(service);
