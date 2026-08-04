import { z } from 'zod';

export const upsertSearchDocumentSchema = z.object({
  documentId: z.string().uuid().optional(),
  documentType: z.enum(['product', 'brand', 'category', 'cms']),
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  summary: z.string().max(300).optional(),
  searchTerm: z.string().min(1).max(160),
  score: z.number().min(0).default(0)
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(160)
});

export type UpsertSearchDocumentDto = z.infer<typeof upsertSearchDocumentSchema>;
