import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TrendingUp,
  AlertCircle,
  Package,
  RefreshCw,
  Play,
} from 'lucide-react';
import { freshmartSdk } from '../../../lib/sdk';
import { useToast } from '@/shared/components/ui/toast';
import { Skeleton, TableSkeleton, CardSkeleton } from '@/shared/components/ui/skeleton';

export const ForecastDashboard: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const {
    data: forecastData,
    isLoading: isLoadingForecast,
    isError: isErrorForecast,
  } = useQuery({
    queryKey: ['inventory', 'forecast'],
    queryFn: async () => {
      const response = await freshmartSdk.inventory.getForecast();
      return response.data;
    },
  });

  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
    isError: isErrorSuggestions,
  } = useQuery({
    queryKey: ['inventory', 'replenishment-suggestions'],
    queryFn: async () => {
      const response = await freshmartSdk.inventory.getReplenishmentSuggestions();
      return response.data || [];
    },
  });

  // Mutation for Auto Replenishment
  const autoReplenishMutation = useMutation({
    mutationFn: async () => {
      const response = await freshmartSdk.inventory.runAutoReplenishment();
      return response.data;
    },
    onSuccess: (data) => {
      showToast(
        `Suggestions Generated: ${data?.suggestionsGenerated || 0}, POs Created: ${data?.purchaseOrdersCreated || 0}`,
        'success',
        'Auto Replenishment Complete'
      );
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['inventory', 'forecast'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'replenishment-suggestions'] });
    },
    onError: (error: any) => {
      showToast(
        error.message || 'An error occurred during auto replenishment',
        'error',
        'Replenishment Failed'
      );
    },
  });

  if (isLoadingForecast || isLoadingSuggestions) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={6} columns={9} />
      </div>
    );
  }

  if (isErrorForecast || isErrorSuggestions) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load forecast data</h3>
        <p className="text-xs text-slate-500">An error occurred while fetching forecasting and replenishment details.</p>
        <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'forecast'] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'replenishment-suggestions'] });
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-white text-xs font-bold shadow-md hover:bg-[#037030] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-120px)] pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Inventory Forecasting & Replenishment
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Analyze stockout risks and automate purchase order generation.
          </p>
        </div>
        <button
          onClick={() => autoReplenishMutation.mutate()}
          disabled={autoReplenishMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {autoReplenishMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>
            {autoReplenishMutation.isPending ? 'Running...' : 'Run Auto Replenishment'}
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Total Products Analyzed
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#0f172a]">
            {forecastData?.totalProductsAnalyzed || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Below Safety Stock
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-amber-600">
            {forecastData?.productsBelowSafetyStock || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Stockout Risk
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-rose-600">
            {forecastData?.productsAtStockoutRisk || 0}
          </span>
        </div>
      </div>

      {/* Suggested Replenishments Table */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e9f2e7] flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#0f172a]">Suggested Replenishments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#e9f2e7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Product ID</th>
                <th className="py-3.5 px-4">Supplier ID</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Daily Consumption</th>
                <th className="py-3.5 px-4">Lead Time (Days)</th>
                <th className="py-3.5 px-4">Safety Stock</th>
                <th className="py-3.5 px-4">Recommended Qty</th>
                <th className="py-3.5 px-4">Est. Stockout Date</th>
                <th className="py-3.5 px-4 text-right">Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {!suggestions || suggestions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No replenishments suggested</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      All products are currently at optimal stock levels.
                    </p>
                  </td>
                </tr>
              ) : (
                suggestions.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#f8fcf7]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.productId}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.supplierId || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-medium">{item.currentStock}</td>
                    <td className="py-3.5 px-4 font-medium">{item.dailyConsumptionRate?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-medium">{item.leadTimeDays}</td>
                    <td className="py-3.5 px-4 font-medium">{item.safetyStock}</td>
                    <td className="py-3.5 px-4 font-bold text-[#04883b]">{item.recommendedOrderQuantity}</td>
                    <td className="py-3.5 px-4 font-medium text-rose-600">
                      {item.estimatedStockoutDate ? new Date(item.estimatedStockoutDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      ${item.unitCost?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
