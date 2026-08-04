import { z } from 'zod';

export const upsertSchema = z.object({
  customerId: z.string().min(1).max(80),
  items: z.array(
    z.object({
      sku: z.string().min(1).max(80),
      productId: z.string().min(1).max(80),
      name: z.string().min(1).max(160),
      quantity: z.number().int().min(1),
      unitPrice: z.number().nonnegative()
    })
  ),
  couponCodes: z.array(z.string().min(1).max(32)).default([])
});

export type UpsertDto = z.infer<typeof upsertSchema>;