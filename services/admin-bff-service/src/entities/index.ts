export interface DashboardView {
  todaysRevenue: number;
  todaysOrders: number;
  pendingOrders: number;
  inventoryAlerts: number;
  bestSellingProducts: Array<{ productId: string; name: string; unitsSold: number }>;
  revenueAnalytics: Array<{ interval: string; revenue: number }>;
  lowStockAlerts: Array<{ sku: string; availableStock: number }>;
  recentActivity: Array<{ timestamp: string; description: string }>;
}

export interface AdminCollectionView {
  items: Array<Record<string, unknown>>;
}

export interface SettingsView {
  cmsPages: Array<Record<string, unknown>>;
  promotions: Array<Record<string, unknown>>;
}
