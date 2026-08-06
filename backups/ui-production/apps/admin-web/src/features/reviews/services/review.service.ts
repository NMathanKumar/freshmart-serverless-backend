import { freshmartSdk } from '../../../lib/sdk';
import type { AdminReview } from '@freshmart/api-sdk';

export interface ReviewModel {
  id: string;
  customerName: string;
  customerAvatar?: string;
  productName: string;
  productCategory: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  statusText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
}

export interface ReviewListParams {
  search?: string;
  status?: string;
  rating?: number | string;
  page?: number;
  limit?: number;
}

const mapReview = (r: AdminReview, idx: number): ReviewModel => {
  const statusRaw = (r.status || 'PENDING').toUpperCase();
  let status: ReviewModel['status'] = 'PENDING';
  let statusText = 'Pending Moderation';
  let statusBadgeBg = 'bg-amber-50';
  let statusBadgeColor = 'text-amber-600';

  if (statusRaw === 'APPROVED') {
    status = 'APPROVED';
    statusText = 'Approved';
    statusBadgeBg = 'bg-[#e6f7ec]';
    statusBadgeColor = 'text-[#04883b]';
  } else if (statusRaw === 'REJECTED') {
    status = 'REJECTED';
    statusText = 'Rejected';
    statusBadgeBg = 'bg-rose-50';
    statusBadgeColor = 'text-rose-600';
  } else if (statusRaw === 'HIDDEN') {
    status = 'HIDDEN';
    statusText = 'Hidden';
    statusBadgeBg = 'bg-slate-100';
    statusBadgeColor = 'text-slate-600';
  }

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  ];

  return {
    id: r.adminItemId,
    customerName: r.data.customerName || 'Customer',
    customerAvatar: sampleAvatars[idx % sampleAvatars.length],
    productName: r.data.productName || 'Product',
    productCategory: 'Produce', // We don't have this in data yet, keeping a placeholder
    rating: r.data.rating ?? 5,
    title: 'Review',
    comment: r.data.comment || '',
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Unknown Date',
    status,
    statusText,
    statusBadgeBg,
    statusBadgeColor,
  };
};

export class ReviewService {
  async listReviews(params: ReviewListParams = {}): Promise<ReviewModel[]> {
    let rawItems: AdminReview[] = [];
    const res = await freshmartSdk.admin.listReviews(params as Record<string, unknown>);
    rawItems = (res as any)?.items ?? (res as any)?.data ?? [];

    const mapped = rawItems.map(mapReview);

    let filtered = mapped;
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(query) ||
          r.productName.toLowerCase().includes(query) ||
          r.comment.toLowerCase().includes(query)
      );
    }

    if (params.status && params.status !== 'All Reviews') {
      filtered = filtered.filter((r) => r.statusText.toLowerCase().includes(params.status!.toLowerCase()));
    }

    return filtered;
  }

  async getReview(id: string): Promise<ReviewModel> {
    const res = await freshmartSdk.admin.getReview(id);
    if (!res.data) {
      throw new Error('Review not found');
    }
    return mapReview(res.data, 0);
  }

  async updateReviewStatus(id: string, status: string): Promise<void> {
    await freshmartSdk.admin.updateReviewStatus(id, status);
  }

  async deleteReview(id: string): Promise<void> {
    await freshmartSdk.admin.deleteReview(id);
  }

  async getReviewStatistics(): Promise<Record<string, number>> {
    const res = await freshmartSdk.admin.getReviewStatistics();
    return res?.data || {};
  }
}

export const reviewService = new ReviewService();

