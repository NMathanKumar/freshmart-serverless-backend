import type { ApiClient } from '../http/create-api-client.js';
import type { ActivityLog } from '../contracts/domain.js';

export class ActivityClient {
  constructor(private readonly client: ApiClient) {}

  async listActivities(params?: Record<string, any>) {
    const response = await this.client.request<{ data: ActivityLog[], meta: any }>({
      method: 'GET',
      url: '/v1/admin/audit',
      params
    });
    return response;
  }

  async getActivity(id: string) {
    const response = await this.client.request<{ data: ActivityLog }>({
      method: 'GET',
      url: `/v1/admin/audit/${id}`
    });
    return response.data;
  }

  async getActivitiesByUser(userId: string) {
    const response = await this.client.request<{ data: ActivityLog[] }>({
      method: 'GET',
      url: `/v1/admin/audit/user/${userId}`
    });
    return response.data;
  }

  async getActivitiesByResource(resource: string) {
    const response = await this.client.request<{ data: ActivityLog[] }>({
      method: 'GET',
      url: `/v1/admin/audit/resource/${resource}`
    });
    return response.data;
  }
}
