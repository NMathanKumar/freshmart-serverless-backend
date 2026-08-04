import type { ApiClient } from '../http/create-api-client.js';
import type { ActivityLog } from '../contracts/domain.js';

export class ActivityClient {
  constructor(private readonly client: ApiClient) {}

  async listActivities(params?: Record<string, any>) {
    const response = await this.client.request<{ data: ActivityLog[], meta: any }>({
      method: 'GET',
      url: '/admin/api/v1/activity',
      params
    });
    return response;
  }

  async getActivity(id: string) {
    const response = await this.client.request<{ data: ActivityLog }>({
      method: 'GET',
      url: `/admin/api/v1/activity/${id}`
    });
    return response.data;
  }

  async getActivitiesByUser(userId: string) {
    const response = await this.client.request<{ data: ActivityLog[] }>({
      method: 'GET',
      url: `/admin/api/v1/activity/user/${userId}`
    });
    return response.data;
  }

  async getActivitiesByResource(resource: string) {
    const response = await this.client.request<{ data: ActivityLog[] }>({
      method: 'GET',
      url: `/admin/api/v1/activity/resource/${resource}`
    });
    return response.data;
  }
}
