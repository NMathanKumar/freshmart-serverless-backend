export interface Review {
  reviewId: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'DELETED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  images?: string[];
  verifiedPurchase?: boolean;
}
