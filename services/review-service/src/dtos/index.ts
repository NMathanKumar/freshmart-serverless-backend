import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).optional()
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DELETED']).optional()
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
