import { z } from 'zod';

export const upsertSchema = z.object({
  categoryId: z.string().uuid().optional(),
  parentCategoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  productCount: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

export type UpsertDto = z.infer<typeof upsertSchema>;