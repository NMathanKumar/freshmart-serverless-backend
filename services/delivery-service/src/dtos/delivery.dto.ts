import { z } from 'zod';

export const deliverySchema = z.object({
  deliveryId: z.string().optional(),
  orderId: z.string(),
  partnerId: z.string().optional(),
  status: z.enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
  recipientName: z.string(),
  deliveryAddress: z.string(),
});

export const assignPartnerSchema = z.object({
  partnerId: z.string(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
});
