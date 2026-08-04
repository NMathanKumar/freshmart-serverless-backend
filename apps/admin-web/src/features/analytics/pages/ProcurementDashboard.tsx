import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { freshmartSdk } from '../../../lib/sdk';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Skeleton } from '../../../components/ui/skeleton';
import { AlertCircle, IndianRupee, Clock, RotateCcw, Package } from 'lucide-react';

export const ProcurementDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['procurementAnalytics'],
    queryFn: () => freshmartSdk.admin.getProcurementAnalytics({ groupBy: 'day' })
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-center text-rose-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Failed to load analytics</p>
      </div>
    );
  }

  const { summary, dailyTrend, paymentAging, supplierRanking } = data.data;
  
  const paymentAgingData = [
    { name: 'Current', value: paymentAging.current, color: '#04883b' },
    { name: '30 Days', value: paymentAging.thirtyDays, color: '#f59e0b' },
    { name: '60 Days', value: paymentAging.sixtyDays, color: '#f97316' },
    { name: '90+ Days', value: paymentAging.ninetyDaysPlus, color: '#ef4444' },
  ];

  const returnRateStr = summary.totalPurchaseOrders > 0 
    ? ((summary.totalVendorReturns / summary.totalPurchaseOrders) * 100).toFixed(1) + '%'
    : '0%';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#0f172a]">Procurement Analytics</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Overview of procurement spend, returns, and supplier performance.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Spend</p>
              <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
                {formatCurrency(summary.procurementSpend || summary.totalPurchaseValue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Return Rate</p>
              <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
                {returnRateStr}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <RotateCcw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Credit Recovery</p>
              <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
                {formatCurrency(summary.totalCreditRecovered)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Outstanding Payables</p>
              <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
                {formatCurrency(summary.outstandingPayables)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spend & Return Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalPurchaseValue" name="Spend" stroke="#04883b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="totalReturnValue" name="Returns" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Aging */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Aging</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentAgingData} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {paymentAgingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">SUPPLIER</th>
                  <th className="px-6 py-3 text-right">SPEND</th>
                  <th className="px-6 py-3 text-right">ON-TIME DELIVERY</th>
                  <th className="px-6 py-3 text-right">RETURN RATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierRanking.map((sup) => (
                  <tr key={sup.supplierId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {sup.supplierName || sup.supplierId}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(sup.totalSpend)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sup.onTimeDeliveryRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right text-orange-600 font-medium">
                      {sup.returnRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {supplierRanking.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No supplier data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
