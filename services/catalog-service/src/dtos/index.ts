import { z } from 'zod';

export const upsertSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  brand: z.string().min(1).max(120),
  sku: z.string().min(3).max(80),
  categoryId: z.string().min(1).max(80),
  subcategoryId: z.string().min(1).max(80).optional(),
  description: z.string().min(10).max(4000),
  specifications: z.record(z.string(), z.string()),
  images: z.array(z.string().url()).min(1),
  variants: z.array(
    z.object({
      variantId: z.string().uuid().optional(),
      name: z.string().min(1).max(120),
      sku: z.string().min(3).max(80),
      price: z.number().nonnegative(),
      currency: z.string().length(3),
      attributes: z.record(z.string(), z.string())
    })
  ),
  weightInGrams: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive()
    })
    .optional(),
  rating: z.number().min(0).max(5).default(0),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER']),
  discountPercentage: z.number().min(0).max(100).optional(),
  inventoryReference: z.string().min(1).max(120)
});

export type UpsertDto = z.infer<typeof upsertSchema>;