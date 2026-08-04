import { z } from 'zod';

export const createNotificationSchema = z.object({
  notificationId: z.string().uuid().optional(),
  recipientUserId: z.string().min(1).max(80),
  type: z.enum(['ORDER', 'PROMOTION', 'SYSTEM']),
  title: z.string().min(2).max(120),
  message: z.string().min(2).max(500)
});

export const markReadSchema = z.object({
  recipientUserId: z.string().min(1).max(80)
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
