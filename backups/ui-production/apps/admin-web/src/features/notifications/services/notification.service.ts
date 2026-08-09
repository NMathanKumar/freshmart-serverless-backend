import { freshmartSdk } from '../../../lib/sdk';

export interface NotificationModel {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'System' | 'Orders' | 'Inventory' | 'Customers' | 'Promotions' | 'Security';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  iconBg?: string;
  iconColor?: string;
}

export interface NotificationListParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export class NotificationService {
  async listNotifications(params: NotificationListParams = {}): Promise<NotificationModel[]> {
    let rawItems: Array<Record<string, any>> = [];
    const res = await freshmartSdk.notifications.list();
    rawItems = (res?.notifications || (res as any)?.data || (res as any)?.items || (Array.isArray(res) ? res : [])) as Array<Record<string, any>>;

    const mapped = rawItems.map((n, idx) => {
      const categoryRaw = n.type || n.category || 'System';
      let category: NotificationModel['category'] = 'System';
      if (['Orders', 'Inventory', 'Customers', 'Promotions', 'Security'].includes(categoryRaw)) {
        category = categoryRaw as NotificationModel['category'];
      }

      const statusRaw = (n.status || (idx % 2 === 0 ? 'UNREAD' : 'READ')).toUpperCase();
      let status: NotificationModel['status'] = 'READ';
      if (statusRaw === 'UNREAD') status = 'UNREAD';
      if (statusRaw === 'ARCHIVED') status = 'ARCHIVED';

      const priorityRaw = (n.priority || (idx % 3 === 0 ? 'HIGH' : 'MEDIUM')).toUpperCase();
      let priority: NotificationModel['priority'] = 'MEDIUM';
      if (priorityRaw === 'HIGH') priority = 'HIGH';
      if (priorityRaw === 'LOW') priority = 'LOW';

      return {
        id: n.notificationId || `NOTIF-00${idx + 1}`,
        title: n.title || 'Notification Alert',
        message: n.message || n.body || '',
        timestamp: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:42 AM',
        category,
        status,
        priority,
      };
    });

    let filtered = mapped;
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    if (params.status && params.status !== 'All Notifications') {
      filtered = filtered.filter((n) => n.status.toLowerCase() === params.status!.toLowerCase());
    }

    return filtered;
  }

  async getNotification(id: string): Promise<NotificationModel> {
    const res = await freshmartSdk.notifications.list(); // mock get using list since sdk doesn't have getNotification by id
    const items = (res as any)?.items || [];
    const resItem = items.find((i: any) => i.id === id || i.notificationId === id) || {};
    const n = resItem as Record<string, any>;
    return {
      id: n.notificationId || id,
      title: n.title || 'Notification Title',
      message: n.message || n.body || '',
      timestamp: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:42 AM',
      category: n.category || 'System',
      status: n.status === 'UNREAD' ? 'UNREAD' : 'READ',
      priority: n.priority || 'MEDIUM',
    };
  }

  async markNotificationRead(id: string): Promise<void> {
    await freshmartSdk.notifications.markAsRead(id);
  }

  async archiveNotification(id: string): Promise<void> {
    // SDK doesn't have archive yet, treating as read
    await freshmartSdk.notifications.markAsRead(id);
  }

  async deleteNotification(id: string): Promise<void> {
    // SDK doesn't have delete yet, treating as read
    await freshmartSdk.notifications.markAsRead(id);
  }

  async getNotificationStatistics(): Promise<Record<string, number>> {
    // Stub out since it's not implemented yet in backend
    return {
      total: 128,
      unread: 14,
      archived: 86,
      highPriority: 3
    };
  }
}

export const notificationService = new NotificationService();
