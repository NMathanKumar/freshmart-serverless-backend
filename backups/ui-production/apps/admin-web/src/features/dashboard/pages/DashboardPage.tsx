import React from 'react';
import {
  ShoppingBag,
  Banknote,
  Users,
  AlertTriangle,
  Plus,
  Ticket,
  MoreVertical,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboardData } from '../hooks/useDashboard';
import { Skeleton } from '../../../components/ui/skeleton';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load dashboard data</h3>
        <p className="text-xs text-slate-500">{error?.message || 'Server error occurred'}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-white font-bold text-xs hover:bg-[#037030] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const { kpis, revenueTrend, categorySales, recentOrders, lowStockItems } = data;

  return (
    <div className="space-y-6">
      {/* Executive Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f172a]">Executive Overview</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time performance metrics for FreshMart global operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8f3e5] text-xs font-bold text-[#0f172a] border border-[#d4e8d1] hover:bg-[#dcefd8] transition-colors">
            <Ticket className="w-4 h-4 text-slate-600" />
            <span>Create Coupon</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e6f7ec] flex items-center justify-center text-[#04883b]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f7ec] text-[#04883b]">
              {kpis.totalOrdersChange}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Total Orders</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
              {kpis.totalOrders.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">{kpis.totalOrdersVs}</p>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-600">
              {kpis.todayRevenueChange}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Today's Revenue</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
              ${kpis.todayRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">{kpis.todayRevenueTarget}</p>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-600">
              {kpis.activeCustomersChange}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Active Customers</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
              {kpis.activeCustomers.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">{kpis.activeCustomersNewToday}</p>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
              {kpis.inventoryAlertsBadge}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Inventory Alerts</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
              {kpis.inventoryAlertsCount} Items
            </p>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">{kpis.inventoryAlertsSubtext}</p>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Trend & Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#0f172a]">Revenue Trend</h3>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-200 text-[#0f172a] shadow-xs">
                Weekly
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
                Monthly
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#04883b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#04883b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#04883b"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#04883b' }}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#0f172a] mb-2">Category Sales</h3>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 mt-4">
            {categorySales.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                </div>
                <span className="font-extrabold text-[#0f172a]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a]">Recent Orders</h3>
            <a href="/orders" className="text-xs font-bold text-[#04883b] hover:underline">
              View All
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3">ORDER ID</th>
                  <th className="px-6 py-3">CUSTOMER</th>
                  <th className="px-6 py-3">STATUS</th>
                  <th className="px-6 py-3">TOTAL</th>
                  <th className="px-6 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-[#0f172a]">{ord.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full ${ord.avatarBg} ${ord.avatarColor} font-bold text-[10px] flex items-center justify-center`}
                          >
                            {ord.customerInitials}
                          </div>
                          <span className="font-semibold text-slate-800">{ord.customerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ord.statusBg} ${ord.statusColor}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#0f172a]">{ord.total}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a]">Low Stock</h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 tracking-wider">
              CRITICAL
            </span>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Inventory is optimal.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0f172a]">{item.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {item.unitsRemaining} units remaining
                      </p>
                    </div>
                  </div>
                  <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${item.barColor} h-1.5 rounded-full`}
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="w-full py-2.5 rounded-xl bg-[#e8f3e5] text-xs font-bold text-[#0f172a] border border-[#d4e8d1] hover:bg-[#dcefd8] transition-colors">
            Restock Inventory
          </button>
        </div>
      </div>
    </div>
  );
};
