import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Notification } from '../entities/index.js';

type NotificationRecord = TableEntity & Notification;

export interface NotificationRepository {
  listByUser(recipientUserId: string): Promise<Notification[]>;
  save(notification: Notification): Promise<Notification>;
  markRead(recipientUserId: string, notificationId: string): Promise<void>;
}

export class DynamoNotificationRepository implements NotificationRepository {
  private readonly repository: DynamoRepository<NotificationRecord>;
  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-notification-service') {
    this.repository = new DynamoRepository<NotificationRecord>(tableName);
  }
  async listByUser(recipientUserId: string): Promise<Notification[]> {
    return this.repository.query(`USER#${recipientUserId}`, 'NOTIFICATION#');
  }
  async save(notification: Notification): Promise<Notification> {
    await this.repository.put({
      pk: `USER#${notification.recipientUserId}`,
      sk: `NOTIFICATION#${notification.notificationId}`,
      gsi1pk: 'ENTITY#NOTIFICATION',
      gsi1sk: `${notification.createdAt}#${notification.notificationId}`,
      ...notification
    });
    return notification;
  }
  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    await this.repository.update(
      { pk: `USER#${recipientUserId}`, sk: `NOTIFICATION#${notificationId}` },
      'SET isRead = :isRead, readAt = :readAt',
      { ':isRead': true, ':readAt': new Date().toISOString() }
    );
  }
}

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications = new Map<string, Notification>();
  async listByUser(recipientUserId: string): Promise<Notification[]> {
    return [...this.notifications.values()].filter((value) => value.recipientUserId === recipientUserId);
  }
  async save(notification: Notification): Promise<Notification> { this.notifications.set(notification.notificationId, notification); return notification; }
  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    const value = this.notifications.get(notificationId);
    if (value?.recipientUserId === recipientUserId) {
      this.notifications.set(notificationId, { ...value, isRead: true, readAt: new Date().toISOString() });
    }
  }
}
