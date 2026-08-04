import { randomUUID } from 'node:crypto';
import type { CreateNotificationDto } from '../dtos/index.js';
import type { Notification } from '../entities/index.js';
import type { NotificationRepository } from '../repositories/index.js';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}
  async listByUser(recipientUserId: string): Promise<Notification[]> { return this.repository.listByUser(recipientUserId); }
  async create(input: CreateNotificationDto): Promise<Notification> {
    return this.repository.save({
      notificationId: input.notificationId ?? randomUUID(),
      recipientUserId: input.recipientUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }
  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    await this.repository.markRead(recipientUserId, notificationId);
  }
}
