import type { ApiClient } from '../http/create-api-client.js';
import type { AnalyticsDashboardResponse } from '../contracts/domain.js';

export class AnalyticsClient {
  constructor(private readonly client: ApiClient) {}

  async getDashboard(dateRange?: string) {
    const response = await this.client.request<{ data: AnalyticsDashboardResponse }>({
      method: 'GET',
      url: '/admin/api/v1/dashboard',
      params: dateRange ? { dateRange } : undefined
    });
    return response.data;
  }
}
