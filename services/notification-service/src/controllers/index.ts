import { jsonResponse, validate } from '@freshmart/platform-core';
import { createNotificationSchema, markReadSchema } from '../dtos/index.js';
import type { NotificationService } from '../services/index.js';

export const createNotificationController = (service: NotificationService) => ({
  list: async (recipientUserId: string) => jsonResponse(200, await service.listByUser(recipientUserId)),
  create: async (body: unknown) => jsonResponse(201, await service.create(validate(createNotificationSchema, body))),
  markRead: async (notificationId: string, body: unknown) => {
    const input = validate(markReadSchema, body);
    await service.markRead(input.recipientUserId, notificationId);
    return jsonResponse(204, null);
  }
});
