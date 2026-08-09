import { reportsService as realReportsService } from './reports.service';

export const reportsService = {
  async getAll() {
    return realReportsService.listReports();
  }
};
