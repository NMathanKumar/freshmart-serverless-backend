import { z } from 'zod';

export const upsertSchema = z.object({
  orderId: z.string().uuid().optional(),
  customerId: z.string().min(1).max(80),
  status: z.enum(['CREATED', 'CONFIRMED', 'PACKED', 'READY', 'COMPLETED', 'CANCELLED']).default('CREATED'),
  items: z.array(
    z.object({
      sku: z.string().min(1).max(80),
      productId: z.string().min(1).max(80),
      quantity: z.number().int().min(1),
      unitPrice: z.number().nonnegative()
    })
  ),
  currency: z.string().length(3),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative()
});

export type UpsertDto = z.infer<typeof upsertSchema>;