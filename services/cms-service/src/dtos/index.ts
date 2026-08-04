import { z } from 'zod';

export const upsertSchema = z.object({
  pageId: z.string().uuid().optional(),
  slug: z.string().min(2).max(120),
  title: z.string().min(2).max(120),
  content: z.string().min(10),
  type: z.enum(['ABOUT_US', 'PRIVACY_POLICY', 'TERMS', 'FAQ', 'CONTACT', 'ANNOUNCEMENT']),
  isPublished: z.boolean().default(false)
});

export type UpsertDto = z.infer<typeof upsertSchema>;