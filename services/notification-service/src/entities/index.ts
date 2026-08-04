export interface Notification {
  notificationId: string;
  recipientUserId: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
