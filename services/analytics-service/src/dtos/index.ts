import { z } from 'zod';

export const upsertSchema = z.object({
  snapshotId: z.string().uuid().optional(),
  dateKey: z.string().min(8).max(10),
  revenue: z.number().nonnegative(),
  sales: z.number().nonnegative(),
  customers: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
  peakHours: z.array(z.string().min(1).max(20)),
  topProducts: z.array(
    z.object({
      productId: z.string().min(1).max(80),
      name: z.string().min(1).max(160),
      unitsSold: z.number().int().nonnegative(),
      revenue: z.number().nonnegative()
    })
  )
});

export type UpsertDto = z.infer<typeof upsertSchema>;