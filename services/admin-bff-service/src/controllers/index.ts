import { jsonResponse } from '@freshmart/platform-core';
import type { AdminBffService } from '../services/index.js';

export const createAdminBffController = (service: AdminBffService) => ({
  dashboard: async (authorization?: string) => jsonResponse(200, await service.getDashboard(authorization)),
  inventory: async (authorization?: string) => jsonResponse(200, await service.getInventory(authorization)),
  analytics: async (authorization?: string) => jsonResponse(200, await service.getAnalytics(authorization)),
  orders: async (authorization?: string) => jsonResponse(200, await service.getOrders(authorization)),
  products: async (authorization?: string) => jsonResponse(200, await service.getProducts(authorization)),
  customers: async (authorization?: string) => jsonResponse(200, await service.getCustomers(authorization)),
  reports: async (authorization?: string) => jsonResponse(200, await service.getReports(authorization)),
  settings: async (authorization?: string) => jsonResponse(200, await service.getSettings(authorization))
});
