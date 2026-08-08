import React, { useState, Suspense, lazy } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';

import { useAnalyticsDashboard, useExportAnalytics } from '../hooks/useAnalytics';
import { Skeleton, ErrorState } from '@/shared/components/ui';
import { isAdmin } from '@freshmart/shared';
import { AdminShell } from '../../admin/components/admin-shell.js';

const AnalyticsCharts = lazy(() => import('../components/AnalyticsCharts'));

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('30d');
  const { data: analytics, isLoading, isError, error, refetch } = useAnalyticsDashboard(period);
  const exportMutation = useExportAnalytics();

  const userIsAdmin = isAdmin();

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to export analytics.');
      return;
    }
    exportMutation.mutate(format, {
      onSuccess: (data) => {
        alert(`Export report ready: ${data.fileName}`);
      },
    });
  };

  if (!userIsAdmin) {
    return (
      <AdminShell searchPlaceholder="Search analytics..." user="alex" variant="operations">
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12 px-5 lg:px-8">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">403 Access Denied</h3>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to access store analytics and financial reports.
        </p>
      </div>
      </AdminShell>
    );
  }

  if (isLoading) {
    return (
      <AdminShell searchPlaceholder="Search analytics..." user="alex" variant="operations">
      <div className="space-y-6 animate-pulse px-5 lg:px-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell searchPlaceholder="Search analytics..." user="alex" variant="operations">
      <div className="my-12 max-w-lg mx-auto px-5 lg:px-8">
        <ErrorState
          title="Failed to load analytics dashboard"
          description={error?.message || 'Server connection error'}
          onRetry={() => refetch()}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
      </AdminShell>
    );
  }

  const summary = analytics || {
    totalRevenue: '$128,450.00',
    totalOrders: '3,420',
    avgOrderValue: '$37.56',
    totalCustomers: '12,480',
    revenueGrowth: '+14.2%',
    orderGrowth: '+8.6%',
    customerGrowth: '+12.4%',
    revenueData: [
      { month: 'Jan', revenue: 45000, orders: 1200 },
      { month: 'Feb', revenue: 52000, orders: 1350 },
      { month: 'Mar', revenue: 61000, orders: 1500 },
      { month: 'Apr', revenue: 58000, orders: 1420 },
      { month: 'May', revenue: 74000, orders: 1800 },
      { month: 'Jun', revenue: 89000, orders: 2100 },
      { month: 'Jul', revenue: 105000, orders: 2500 },
    ],
    categoryData: [
      { name: 'Fresh Produce', value: 45, color: '#04883b' },
      { name: 'Dairy & Eggs', value: 25, color: '#0d9488' },
      { name: 'Bakery & Bread', value: 18, color: '#f59e0b' },
      { name: 'Beverages', value: 12, color: '#6366f1' },
    ],
    topProducts: [
      { name: 'Organic Hass Avocados', category: 'Fresh Produce', sales: '1,420 units', revenue: '$7,100.00' },
      { name: 'Fresh Organic Whole Milk', category: 'Dairy & Eggs', sales: '980 units', revenue: '$4,410.00' },
      { name: 'Artisanal Sourdough Bread', category: 'Bakery & Bread', sales: '750 units', revenue: '$4,875.00' },
    ],
  };

  return (
    <AdminShell searchPlaceholder="Search analytics..." user="alex" variant="operations">
    <div className="space-y-6 min-h-[calc(100vh-120px)] pb-12 px-5 lg:px-8">
      {/* Title & Period Selector / Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#04883b]" />
            <h1 className="text-2xl font-extrabold text-[#0f172a]">Store Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Performance metrics, sales trends, revenue distribution, and customer acquisition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#e9f2e7] p-1 rounded-xl">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  period === p ? 'bg-[#04883b] text-white shadow-xs' : 'text-slate-600 hover:text-[#04883b]'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 w-36">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Export Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL REVENUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ec] flex items-center justify-center text-[#04883b]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{summary.totalRevenue}</span>
            <span className="text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {summary.revenueGrowth}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL ORDERS
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{summary.totalOrders}</span>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {summary.orderGrowth}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              AVG. ORDER VALUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{summary.avgOrderValue}</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Stable
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL CUSTOMERS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{summary.totalCustomers}</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {summary.customerGrowth}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Section (Lazy Loaded) */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm lg:col-span-2 space-y-4 h-80 flex items-center justify-center">
            <span className="text-sm font-medium text-slate-400">Loading charts...</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4 h-80 flex items-center justify-center">
             <span className="text-sm font-medium text-slate-400">Loading metrics...</span>
          </div>
        </div>
      }>
        <AnalyticsCharts revenueData={summary.revenueData} categoryData={summary.categoryData} />
      </Suspense>

      {/* Top Selling Products Table */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0f172a]">Top Performing Products</h3>
          <span className="text-xs font-bold text-[#04883b]">View All Products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">UNITS SOLD</th>
                <th className="px-6 py-4 text-right">GROSS REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {summary.topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#0f172a]">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f0f7ee] text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.sales}</td>
                  <td className="px-6 py-4 text-right font-extrabold text-[#04883b]">
                    {p.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AdminShell>
  );
};
