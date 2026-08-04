import { z } from 'zod';

export const upsertBrandSchema = z.object({
  brandId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().default(true)
});

export type UpsertBrandDto = z.infer<typeof upsertBrandSchema>;
