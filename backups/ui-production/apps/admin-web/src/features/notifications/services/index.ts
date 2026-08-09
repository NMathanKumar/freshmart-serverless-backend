import { notificationService as realNotificationService } from './notification.service';

export const notificationsService = {
  async getAll() {
    return realNotificationService.listNotifications();
  }
};
