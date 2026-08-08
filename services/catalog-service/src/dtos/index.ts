import { z } from 'zod';

export const upsertSchema = z.object({
  productId: z.string().optional(),
  id: z.string().optional(),
  name: z.string().min(1).max(200).optional(),
  productName: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  brand: z.string().optional().default('FreshMart'),
  sku: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  description: z.string().optional().default('Fresh organic product delivered straight from local farms.'),
  price: z.number().nonnegative().optional(),
  stock: z.number().nonnegative().optional(),
  specifications: z.record(z.string(), z.string()).optional().default({}),
  images: z.array(z.string()).optional().default([]),
  variants: z.array(z.any()).optional().default([]),
  weightInGrams: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive()
    })
    .optional(),
  rating: z.number().min(0).max(5).default(0),
  availability: z.union([z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER']), z.boolean(), z.string()]).optional().default('IN_STOCK'),
  available: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  inventoryReference: z.string().optional()
});

export type UpsertDto = z.infer<typeof upsertSchema>;