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
  async getAnalyticsDashboard(period = '30d', signal?: AbortSignal): Promise<AnalyticsSummaryModel> {
    try {
      const res = await freshmartSdk.admin.getAnalyticsDashboard({ period }, { signal });
      const d = (res?.data || res || {}) as Record<string, any>;

      const totalRevenueNum = Number(d.totalRevenue) || 0;
      const totalOrdersNum = Number(d.totalOrders) || 0;
      const avgOrderValueNum = Number(d.avgOrderValue) || (totalOrdersNum > 0 ? totalRevenueNum / totalOrdersNum : 0);
      const totalCustomersNum = Number(d.totalCustomers) || 0;

      return {
        totalRevenue: `₹${totalRevenueNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalOrders: totalOrdersNum.toLocaleString('en-IN'),
        avgOrderValue: `₹${avgOrderValueNum.toFixed(2)}`,
        totalCustomers: totalCustomersNum.toLocaleString('en-IN'),
        revenueGrowth: d.revenueGrowth ? `${typeof d.revenueGrowth === 'number' && d.revenueGrowth > 0 ? '+' : ''}${d.revenueGrowth}` : '+0.0%',
        orderGrowth: d.orderGrowth ? `${typeof d.orderGrowth === 'number' && d.orderGrowth > 0 ? '+' : ''}${d.orderGrowth}` : '+0.0%',
        customerGrowth: d.customerGrowth ? `${typeof d.customerGrowth === 'number' && d.customerGrowth > 0 ? '+' : ''}${d.customerGrowth}` : '+0.0%',
        revenueData: Array.isArray(d.revenueData) ? d.revenueData : [],
        categoryData: Array.isArray(d.categoryData) ? d.categoryData : [],
        topProducts: Array.isArray(d.topProducts) ? d.topProducts : [],
      };
    } catch (_err) {
      return {
        totalRevenue: '₹0.00',
        totalOrders: '0',
        avgOrderValue: '₹0.00',
        totalCustomers: '0',
        revenueGrowth: '+0.0%',
        orderGrowth: '+0.0%',
        customerGrowth: '+0.0%',
        revenueData: [],
        categoryData: [],
        topProducts: [],
      };
    }
  }

  async getRevenueAnalytics(params: Record<string, unknown> = {}, signal?: AbortSignal): Promise<Record<string, unknown>> {
    try {
      const res = await freshmartSdk.admin.getRevenueAnalytics(params, { signal });
      return res?.data || res || {};
    } catch {
      return {};
    }
  }

  async getOrderAnalytics(params: Record<string, unknown> = {}, signal?: AbortSignal): Promise<Record<string, unknown>> {
    try {
      const res = await freshmartSdk.admin.getOrderAnalytics(params, { signal });
      return res?.data || res || {};
    } catch {
      return {};
    }
  }

  async getCustomerAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    try {
      const res = await freshmartSdk.admin.getCustomerAnalytics(params);
      return res?.data ?? res ?? {};
    } catch {
      return {};
    }
  }

  async getProductAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    try {
      const res = await freshmartSdk.admin.getProductAnalytics(params);
      return res?.data ?? res ?? {};
    } catch {
      return {};
    }
  }

  async getCategoryAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    try {
      const res = await freshmartSdk.admin.getCategoryAnalytics(params);
      return res?.data ?? res ?? {};
    } catch {
      return {};
    }
  }

  async getInventoryAnalytics(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    try {
      const res = await freshmartSdk.admin.getInventoryAnalytics(params);
      return res?.data ?? res ?? {};
    } catch {
      return {};
    }
  }

  async exportAnalyticsReport(format: string): Promise<{ downloadUrl: string; fileName: string }> {
    try {
      const isBrowser = typeof window !== 'undefined';
      const baseUrl = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';
      const downloadUrl = `${baseUrl}/admin/analytics/export?format=${encodeURIComponent(format)}`;
      const fileName = `freshmart_analytics_report_${Date.now()}.${format === 'excel' ? 'csv' : format}`;

      if (isBrowser) {
        const token = getAccessToken();
        const response = await fetch(downloadUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }

      return { downloadUrl, fileName };
    } catch {
      return {
        downloadUrl: '#',
        fileName: `analytics_report_${Date.now()}.${format}`,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
