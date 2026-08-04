export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface AnalyticsSnapshot {
  snapshotId: string;
  dateKey: string;
  revenue: number;
  sales: number;
  customers: number;
  orders: number;
  peakHours: string[];
  topProducts: TopProduct[];
  createdAt: string;
}