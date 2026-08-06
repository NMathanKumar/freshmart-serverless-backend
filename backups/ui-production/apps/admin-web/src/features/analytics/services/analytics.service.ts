import { freshmartSdk } from '../../../lib/sdk';
import { getAccessToken } from '@freshmart/shared';

export interface AnalyticsSummaryModel {
  totalRevenue: string;
  totalOrders: string;
  avgOrderValue: string;
  totalCustomers: string;
  revenueGrowth: string;
  orderGrowth: string;
  customerGrowth: string;
  revenueData: Array<{ month: string; revenue: number; orders: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  topProducts: Array<{ name: string; category: string; sales: string; revenue: string }>;
}

export class AnalyticsService {
  async getAnalyticsDashboard(period = '30d'): Promise<AnalyticsSummaryModel> {
    const res = await freshmartSdk.admin.getAnalyticsDashboard({ period });
    const d = (res?.data || res || {}) as Record<string, any>;

    return {
      totalRevenue: d.totalRevenue ? `₹${Number(d.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
      totalOrders: d.totalOrders ? Number(d.totalOrders).toLocaleString('en-IN') : '0',
      avgOrderValue: d.avgOrderValue ? `₹${Number(d.avgOrderValue).toFixed(2)}` : '₹0.00',
      totalCustomers: d.totalCustomers ? Number(d.totalCustomers).toLocaleString('en-IN') : '0',
      revenueGrowth: d.revenueGrowth ? `${Number(d.revenueGrowth) > 0 ? '+' : ''}${d.revenueGrowth}%` : '0%',
      orderGrowth: d.orderGrowth ? `${Number(d.orderGrowth) > 0 ? '+' : ''}${d.orderGrowth}%` : '0%',
      customerGrowth: d.customerGrowth ? `${Number(d.customerGrowth) > 0 ? '+' : ''}${d.customerGrowth}%` : '0%',
      revenueData: d.revenueData || [],
      categoryData: d.categoryData || [],
      topProducts: d.topProducts || [],
    };
  }

  async getRevenueAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getRevenueAnalytics(params);
    return res.data ?? {};
  }

  async getOrderAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getOrderAnalytics(params);
    return res.data ?? {};
  }

  async getCustomerAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getCustomerAnalytics(params);
    return res.data ?? {};
  }

  async getProductAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getRevenueAnalytics(params);
    return res.data ?? {};
  }

  async getCategoryAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getRevenueAnalytics(params);
    return res.data ?? {};
  }

  async getInventoryAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getRevenueAnalytics(params);
    return res.data ?? {};
  }

  async exportAnalyticsReport(format: string): Promise<{ downloadUrl: string; fileName: string }> {
    return {
      downloadUrl: '#',
      fileName: `analytics_report_${Date.now()}.${format}`,
    };
  }
}

export const analyticsService = new AnalyticsService();
