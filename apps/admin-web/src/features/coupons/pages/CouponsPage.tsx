import React, { useState } from 'react';
import { Plus, Filter, Download, Edit3, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { useCoupons, useCreateCoupon, useUpdateCoupon } from '../hooks/useCoupons';
import { Switch } from '../../../components/ui/switch';
import { Skeleton } from '../../../components/ui/skeleton';
import { isAdmin } from '@freshmart/shared';

export const CouponsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: coupons, isLoading, isError, error, refetch } = useCoupons({ page, limit: 10 });
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();

  const userIsAdmin = isAdmin();

  const handleToggleStatus = (id: string, currentActive: boolean) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to toggle coupon status.');
      return;
    }
    updateCouponMutation.mutate({
      id,
      input: { status: currentActive ? 'INACTIVE' : 'ACTIVE' },
    });
  };

  const handleCreateCoupon = () => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to create coupons.');
      return;
    }
    const code = prompt('Enter Coupon Code (e.g. SUMMER2024):');
    if (code) {
      const name = prompt('Enter Campaign Name:', 'Summer Sale Promo') || 'Promotional Campaign';
      const discountStr = prompt('Enter Discount Percentage (e.g. 20):', '20');
      const discountValue = parseInt(discountStr || '20', 10);
      createCouponMutation.mutate({
        code: code.toUpperCase(),
        name,
        discountType: 'percentage',
        discountValue,
        minOrderValue: 50,
        usageLimit: 1000,
        status: 'ACTIVE',
      });
    }
  };

  if (!userIsAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">403 Access Denied</h3>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to manage store coupons and discount campaigns.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load coupons</h3>
        <p className="text-xs text-slate-500">{error?.message || 'Server connection error'}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-white font-bold text-xs hover:bg-[#037030] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const displayCoupons = coupons ?? [];
  const activeCoupons = displayCoupons.filter((c) => c.status === 'ACTIVE').length;
  const inactiveCoupons = displayCoupons.filter((c) => c.status !== 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Coupons & Promotions</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your customer loyalty programs and seasonal discount campaigns.
          </p>
        </div>
        <button
          onClick={handleCreateCoupon}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Summary Cards (derived from real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL COUPONS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{displayCoupons.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            ACTIVE COUPONS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{activeCoupons}</span>
            <span className="text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            INACTIVE / EXPIRED
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{inactiveCoupons}</span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Archived
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL REDEMPTIONS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">
              {displayCoupons.reduce((sum, c) => sum + c.usageCount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {displayCoupons.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-[#e9f2e7] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#e6f7ec] text-[#04883b] flex items-center justify-center mx-auto">
            <Tag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">No coupons yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first promotional coupon to start driving customer engagement and revenue.
          </p>
          <button
            onClick={handleCreateCoupon}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white hover:bg-[#037030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Coupon</span>
          </button>
        </div>
      )}

      {/* Coupons Table */}
      {displayCoupons.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a]">Recent Coupons</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">COUPON CODE</th>
                  <th className="px-6 py-4">CAMPAIGN NAME</th>
                  <th className="px-6 py-4">DISCOUNT TYPE</th>
                  <th className="px-6 py-4">VALUE</th>
                  <th className="px-6 py-4">VALIDITY</th>
                  <th className="px-6 py-4">USAGE</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                  <th className="px-6 py-4 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {displayCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-[#e6f7ec] text-[#04883b] border border-[#d4e8d1]">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0f172a]">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600">{c.type}</td>
                    <td className="px-6 py-4 font-extrabold text-[#0f172a]">{c.discount}</td>
                    <td className="px-6 py-4 text-slate-600">{c.expiresAt}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {c.usageCount.toLocaleString()}{c.maxUsage > 0 ? ` / ${c.maxUsage.toLocaleString()}` : ''}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={c.status === 'ACTIVE'}
                        onChange={() => handleToggleStatus(c.id, c.status === 'ACTIVE')}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => alert(`Editing coupon ${c.code}`)}
                          className="p-1 hover:text-[#04883b] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
