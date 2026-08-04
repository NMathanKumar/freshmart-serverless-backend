import { z } from 'zod';

export const upsertSchema = z.object({
  sku: z.string().min(3).max(80),
  availableStock: z.number().int().min(0),
  reservedStock: z.number().int().min(0),
  soldStock: z.number().int().min(0),
  restockThreshold: z.number().int().min(0),
  warehouse: z.string().min(2).max(120)
});

export type UpsertDto = z.infer<typeof upsertSchema>;