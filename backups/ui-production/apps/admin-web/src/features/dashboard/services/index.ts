import { dashboardService as realDashboardService } from './dashboard.service';

export const dashboardService = {
  async getMetrics() {
    return realDashboardService.getDashboardData();
  }
};
