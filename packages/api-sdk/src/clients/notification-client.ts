import type { NotificationsResponse } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';

export class NotificationClient {
  constructor(private readonly client: ApiClient) {}

  list(recipientUserId?: string) {
    return this.client.request<NotificationsResponse>({
      method: 'GET',
      url: recipientUserId ? `/api/v1/notifications/${recipientUserId}` : '/api/v1/notifications'
    });
  }

  async markAsRead(id: string) {
    const response = await this.client.request<{ data: any }>({
      method: 'PUT',
      url: `/api/v1/notifications/${id}/read`
    });
    return response.data;
  }

  async markAllAsRead() {
    const response = await this.client.request<{ data: any }>({
      method: 'PUT',
      url: `/api/v1/notifications/read-all`
    });
    return response.data;
  }
}
