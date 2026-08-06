import { analyticsService as realAnalyticsService } from './analytics.service';

export const analyticsService = {
  async getAll() {
    const data = await realAnalyticsService.getAnalyticsDashboard();
    return [data];
  }
};
