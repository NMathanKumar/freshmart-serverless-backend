import { randomUUID } from 'node:crypto';
import { DomainError } from '@freshmart/platform-core';
import type { UpsertCouponDto, ValidateCouponDto, RedeemCouponDto } from '../dtos/index.js';
import type { Coupon } from '../entities/index.js';
import type { DynamoCouponRepository } from '../repositories/index.js';

export class CouponService {
  constructor(private readonly repository: DynamoCouponRepository) {}

  async list(): Promise<Coupon[]> {
    return this.repository.list();
  }

  async getById(couponId: string): Promise<Coupon> {
    const coupon = await this.repository.getById(couponId);
    if (!coupon) throw new DomainError('Coupon not found.', 404);
    return coupon;
  }

  async getByCode(code: string): Promise<Coupon> {
    const coupon = await this.repository.getByCode(code);
    if (!coupon) throw new DomainError('Coupon not found.', 404);
    return coupon;
  }

  async upsert(input: UpsertCouponDto, createdBy: string = 'system'): Promise<Coupon> {
    const now = new Date().toISOString();
    
    // Check code uniqueness if it's a new coupon
    if (!input.couponId) {
      const existing = await this.repository.getByCode(input.code);
      if (existing) throw new DomainError('Coupon code already exists.', 409);
    }
    
    let existingCoupon: Coupon | null = null;
    if (input.couponId) {
      existingCoupon = await this.repository.getById(input.couponId);
      if (!existingCoupon) throw new DomainError('Coupon not found.', 404);
    }
    
    const coupon: Coupon = {
      couponId: existingCoupon?.couponId ?? randomUUID(),
      code: input.code,
      title: input.title,
      description: input.description,
      discountType: input.discountType,
      discountValue: input.discountValue,
      maximumDiscount: input.maximumDiscount,
      minimumOrderValue: input.minimumOrderValue,
      usageLimit: input.usageLimit,
      perUserLimit: input.perUserLimit,
      currentUsage: existingCoupon?.currentUsage ?? 0,
      startDate: input.startDate,
      endDate: input.endDate,
      applicableCategories: input.applicableCategories,
      applicableProducts: input.applicableProducts,
      excludedProducts: input.excludedProducts,
      excludedCategories: input.excludedCategories,
      customerEligibility: input.customerEligibility,
      stackable: input.stackable ?? existingCoupon?.stackable ?? false,
      active: input.active ?? existingCoupon?.active ?? true,
      status: input.status ?? existingCoupon?.status ?? 'ACTIVE',
      createdBy: existingCoupon?.createdBy ?? createdBy,
      updatedBy: createdBy,
      createdAt: existingCoupon?.createdAt ?? now,
      updatedAt: now
    };
    
    return this.repository.save(coupon);
  }

  async validate(input: ValidateCouponDto): Promise<{ valid: boolean; discountAmount: number; finalOrderValue: number; reason?: string }> {
    const coupon = await this.repository.getByCode(input.code);
    
    if (!coupon) return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Coupon not found.' };
    if (!coupon.active || coupon.status !== 'ACTIVE') return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Coupon is not active.' };
    
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Coupon is not yet valid.' };
    if (coupon.endDate && new Date(coupon.endDate) < now) return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Coupon has expired.' };
    
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Coupon usage limit reached.' };

    if (coupon.perUserLimit) {
      const userUsage = await this.repository.getUserUsage(coupon.couponId, input.customerId);
      if (userUsage >= coupon.perUserLimit) return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Per-user usage limit reached.' };
    }
    
    if (coupon.minimumOrderValue && input.orderValue < coupon.minimumOrderValue) return { valid: false, discountAmount: 0, finalOrderValue: input.orderValue, reason: 'Minimum order value not met.' };
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = input.orderValue * (coupon.discountValue / 100);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      // Assuming free shipping represents a certain fixed value, or the BFF handles it. For now, 0 logic or set a specific response.
      discountAmount = 0; // The caller should know it's free shipping
    }
    
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }
    
    const finalOrderValue = Math.max(0, input.orderValue - discountAmount);
    
    return { valid: true, discountAmount, finalOrderValue };
  }

  async redeem(input: RedeemCouponDto): Promise<{ success: boolean; reason?: string }> {
    const coupon = await this.repository.getByCode(input.code);
    if (!coupon) throw new DomainError('Coupon not found.', 404);
    
    try {
      await this.repository.incrementUsage(coupon.couponId, input.customerId, coupon.usageLimit, coupon.perUserLimit);
      return { success: true };
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException' || error.name === 'TransactionCanceledException') {
        throw new DomainError('Coupon usage limit reached.', 400);
      }
      throw error;
    }
  }
}
