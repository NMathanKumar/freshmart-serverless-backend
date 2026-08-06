import { freshmartSdk } from '../../../lib/sdk';
import type { AdminDashboardData } from '@freshmart/api-sdk';

export interface DashboardModel {
  kpis: {
    totalOrders: number;
    totalOrdersChange: string;
    totalOrdersVs: string;
    todayRevenue: number;
    todayRevenueChange: string;
    todayRevenueTarget: string;
    activeCustomers: number;
    activeCustomersChange: string;
    activeCustomersNewToday: string;
    inventoryAlertsCount: number;
    inventoryAlertsBadge: string;
    inventoryAlertsSubtext: string;
  };
  revenueTrend: Array<{ name: string; revenue: number }>;
  categorySales: Array<{ name: string; value: number; color: string }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    customerInitials: string;
    avatarBg: string;
    avatarColor: string;
    status: 'Delivered' | 'Processing' | 'Pending';
    statusBg: string;
    statusColor: string;
    total: string;
  }>;
  lowStockItems: Array<{
    name: string;
    unitsRemaining: number;
    progressPercentage: number;
    barColor: string;
    image: string;
  }>;
}

export class DashboardService {
  async getDashboardData(): Promise<DashboardModel> {
    const res = await freshmartSdk.analytics.getDashboard();
    const data = ((res as any)?.data || res || {}) as any;

    const totalOrders = data.totalOrders ?? 0;
    const todayRevenue = data.totalRevenue ?? 0;
    const activeCustomers = data.totalCustomers ?? 0;
    const inventoryAlertsCount = data.lowStockCount ?? (data.inventoryAlerts?.length || 0);

    const recentOrdersMapped: DashboardModel['recentOrders'] =
      (data.recentOrders || []).map((o: any, idx: number) => {
        const initials = (o.customerName || 'Customer')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        let statusFormatted: 'Delivered' | 'Processing' | 'Pending' = 'Delivered';
        let statusBg = 'bg-[#e6f7ec]';
        let statusColor = 'text-[#04883b]';

        if (
          o.orderStatus === 'PROCESSING' ||
          o.orderStatus === 'ACCEPTED' ||
          o.orderStatus === 'PREPARING'
        ) {
          statusFormatted = 'Processing';
          statusBg = 'bg-teal-50';
          statusColor = 'text-teal-600';
        } else if (o.orderStatus === 'PLACED' || o.orderStatus === 'PENDING') {
          statusFormatted = 'Pending';
          statusBg = 'bg-[#fffbeb]';
          statusColor = 'text-amber-600';
        }

        return {
          id: o.orderId?.startsWith('#') ? o.orderId : `#${o.orderId || '001'}`,
          customerName: o.customerName || 'Customer',
          customerInitials: initials,
          avatarBg: idx % 3 === 0 ? 'bg-[#e6f7ec]' : idx % 3 === 1 ? 'bg-pink-100' : 'bg-slate-200',
          avatarColor: idx % 3 === 0 ? 'text-[#04883b]' : idx % 3 === 1 ? 'text-pink-600' : 'text-slate-600',
          status: statusFormatted,
          statusBg,
          statusColor,
          total: `₹${(o.totalAmount || 0).toFixed(2)}`,
        };
      });

    const lowStockMapped = (data.inventoryAlerts || []).map((item: any) => ({
      name: item.productName || 'Product',
      unitsRemaining: item.currentStock ?? 0,
      progressPercentage: Math.min(
        100,
        Math.max(5, ((item.currentStock || 0) / (item.minimumStock || 20)) * 100)
      ),
      barColor: (item.currentStock || 0) < 5 ? 'bg-rose-600' : 'bg-[#04883b]',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&auto=format&fit=crop&q=80',
    }));

    return {
      kpis: {
        totalOrders,
        totalOrdersChange: '+12%',
        totalOrdersVs: 'vs yesterday',
        todayRevenue,
        todayRevenueChange: '+8.4%',
        todayRevenueTarget: 'Goal: ₹20,000',
        activeCustomers,
        activeCustomersChange: '+5%',
        activeCustomersNewToday: '12 new today',
        inventoryAlertsCount,
        inventoryAlertsBadge: inventoryAlertsCount > 0 ? 'Requires Restock' : 'Optimal',
        inventoryAlertsSubtext: `${inventoryAlertsCount} products below threshold`,
      },
      revenueTrend: data?.charts?.revenueTrend || [],
      categorySales: data?.charts?.categorySales || [],
      recentOrders: recentOrdersMapped,
      lowStockItems: lowStockMapped,
    };
  }
}

export const dashboardService = new DashboardService();
