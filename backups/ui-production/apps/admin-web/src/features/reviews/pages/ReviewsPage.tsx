import React, { useState } from 'react';
import { Download, RefreshCw, Star, Send, Check, AlertCircle, XCircle } from 'lucide-react';
import { useReviews, useUpdateReviewStatus, useDeleteReview } from '../hooks/useReviews';
import { Skeleton } from '../../../components/ui/skeleton';
import { isAdmin } from '@freshmart/shared';

export const ReviewsPage: React.FC = () => {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const { data: reviews, isLoading, isError, error, refetch } = useReviews({ limit: 10 });
  const updateStatusMutation = useUpdateReviewStatus();
  const deleteReviewMutation = useDeleteReview();

  const userIsAdmin = isAdmin();

  const handleModeration = (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'HIDDEN') => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to moderate reviews.');
      return;
    }
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleSendResponse = (id: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    if (!adminReplyText.trim()) return;
    alert(`Response sent to review ${id}: "${adminReplyText}"`);
    setAdminReplyText('');
  };

  if (!userIsAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">403 Access Denied</h3>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to moderate customer ratings and product reviews.
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
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[450px] lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-[450px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load customer reviews</h3>
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

  const displayReviews = reviews || [];
  const activeReview = displayReviews.find((r) => r.id === selectedReviewId) || displayReviews[0];

  if (!isLoading && !isError && displayReviews.length === 0) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
          <Star className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">No Reviews Found</h3>
        <p className="text-xs text-slate-500">There are currently no customer reviews to moderate.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Reviews & Ratings</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage customer feedback and maintain product quality standards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Exporting Reviews CSV')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8f3e5] text-xs font-bold text-[#0f172a] border border-[#d4e8d1] hover:bg-[#dcefd8] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            AVERAGE RATING
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">4.8</span>
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL REVIEWS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">3,240</span>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              242 new this week
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            PENDING REVIEWS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-600">18</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            FLAGGED REVIEWS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-rose-600">3</span>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              High Priority
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Table (2/3) & Review Detail Drawer (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviews Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">PRODUCT</th>
                  <th className="px-6 py-4">CUSTOMER</th>
                  <th className="px-6 py-4">RATING</th>
                  <th className="px-6 py-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {displayReviews.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReviewId(r.id)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeReview.id === r.id ? 'bg-[#f4fcf0]' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-[#0f172a]">{r.productName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={r.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'} alt={r.customerName} className="w-6 h-6 rounded-full" />
                        <span className="font-semibold text-slate-800">{r.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.statusBadgeBg} ${r.statusBadgeColor}`}>
                        {r.statusText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Detail Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0f172a]">Review Detail</h3>

          <div className="p-3 bg-[#f0f7ee] rounded-xl flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=80&auto=format&fit=crop&q=80"
              alt="Avocado"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs font-bold text-[#0f172a]">{activeReview.productName}</p>
              <div className="flex items-center text-amber-400 mt-0.5">
                {Array.from({ length: activeReview.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#04883b] text-white font-bold text-[10px] flex items-center justify-center">
                {activeReview.customerName.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-xs font-bold text-[#0f172a]">{activeReview.customerName}</p>
                <p className="text-[10px] text-slate-400">Verified Buyer • {activeReview.date}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
              "{activeReview.comment}"
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">Admin Response</label>
            <textarea
              value={adminReplyText}
              onChange={(e) => setAdminReplyText(e.target.value)}
              placeholder={`Write your response to ${activeReview.customerName}...`}
              className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b] min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSendResponse(activeReview.id)}
              className="flex-1 bg-[#04883b] hover:bg-[#037030] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#04883b]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Response</span>
            </button>
            <button
              onClick={() => handleModeration(activeReview.id, 'APPROVED')}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
