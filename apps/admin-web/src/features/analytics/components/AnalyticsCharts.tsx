import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export interface AnalyticsChartsProps {
  revenueData: Array<{ month: string; revenue: number; orders: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ revenueData, categoryData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Growth Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Revenue & Order Growth Trend</h3>
            <p className="text-xs text-slate-400 font-medium">
              Monthly gross revenue vs completed customer orders
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#04883b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#04883b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#04883b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Category (Pie Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4 flex flex-col">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a]">Revenue by Category</h3>
          <p className="text-xs text-slate-400 font-medium">Sales distribution across segments</p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-4">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#0f172a]">{cat.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
