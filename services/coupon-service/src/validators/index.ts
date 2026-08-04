import { z } from 'zod';

export const upsertCouponSchema = z.object({
  couponId: z.string().optional(),
  code: z.string().min(3).max(30),
  title: z.string().min(1),
  description: z.string().min(1),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  discountValue: z.number().min(0),
  maximumDiscount: z.number().optional(),
  minimumOrderValue: z.number().optional(),
  usageLimit: z.number().optional(),
  perUserLimit: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional(),
  excludedCategories: z.array(z.string()).optional(),
  customerEligibility: z.enum(['ALL', 'NEW_USER']).optional(),
  stackable: z.boolean().optional(),
  active: z.boolean().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']).optional()
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().min(1),
  orderValue: z.number().min(0),
  cartItems: z.array(z.object({
    productId: z.string(),
    categoryId: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  }))
});

export const redeemCouponSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().min(1),
  orderId: z.string().min(1)
});
