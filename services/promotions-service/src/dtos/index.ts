import { z } from 'zod';

export const upsertPromotionSchema = z.object({
  promotionId: z.string().uuid().optional(),
  code: z.string().min(3).max(32),
  title: z.string().min(2).max(120),
  description: z.string().min(5).max(500),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true)
});

export type UpsertPromotionDto = z.infer<typeof upsertPromotionSchema>;
