import { z } from 'zod';

export const checkoutQuerySchema = z.object({
  customerId: z.string().min(1).max(80)
});

export type CheckoutQueryDto = z.infer<typeof checkoutQuerySchema>;