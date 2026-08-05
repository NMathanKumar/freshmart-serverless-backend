import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Flag,
  MessageSquare,
  Star,
  Trash2,
  X
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { deleteReview as apiDeleteReview, fetchAdminReviews, moderateReview } from '../api/admin-api.js';
import { reviewRows } from '../model/mock-data.js';

interface ReviewRecord {
  id: string;
  product: string;
  productImage: string;
  customer: string;
  customerInitials: string;
  date: string;
  rating: number;
  status: string;
  comment: string;
}

const ReviewStars = ({ rating }: { rating: number }) => (
  <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} className={index < rating ? 'filled' : ''} aria-hidden="true" />
    ))}
  </span>
);

const ReviewsPage = () => {
  const { data: reviewData, retry, state } = useApiResource(fetchAdminReviews);
  const reviewsList = reviewData?.data ?? [];

  const reviews: ReviewRecord[] = useMemo(() => {
    if (reviewsList.length > 0) {
      return reviewsList.map((item: any, index: number) => {
        const data = item.data as Record<string, unknown>;
        return {
          id: item.adminItemId,
          product: String(data.productId || 'Fresh Product'),
          productImage: reviewRows[index % reviewRows.length]?.image ?? '',
          customer: String(data.customerId || 'Customer'),
          customerInitials: String(data.customerId || 'CU').slice(0, 2).toUpperCase(),
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
          rating: Number(data.rating || 5),
          status: item.status || 'APPROVED',
          comment: String(data.comment || 'Great quality!')
        };
      });
    }
    return reviewRows.map((row, index) => ({
      id: `REV-${index + 1}`,
      product: row.product,
      productImage: row.image,
      customer: row.customer,
      customerInitials: row.customer.split(' ').map((p) => p[0]).join('').slice(0, 2),
      date: row.date,
      rating: 4,
      status: row.status,
      comment: 'The quality is amazing, but the packaging was slightly damaged when it arrived. Still tastes great though!'
    }));
  }, [reviewsList]);

  const [selectedId, setSelectedId] = useState<string>();
  const currentReview = reviews.find((r) => r.id === selectedId) ?? reviews[0];

  const reviewMetrics = [
    { title: 'Average Rating', value: '4.8', badge: '+0.2 from last month', tone: 'success', icon: Star },
    { title: 'Total Reviews', value: String(reviews.length || '3,240'), badge: '124 new today', tone: 'success', icon: MessageSquare },
    { title: 'Pending Reviews', value: String(reviews.filter((r) => r.status === 'PENDING').length || '18'), badge: 'Requires Action', tone: 'danger', icon: CheckCircle2 },
    { title: 'Flagged Reviews', value: String(reviews.filter((r) => r.status === 'FLAGGED').length || '3'), badge: 'High Priority', tone: 'danger', icon: Flag }
  ];

  const moderateHandler = async (id: string, status: string) => {
    await moderateReview(id, { status });
    retry();
  };

  const deleteHandler = async (id: string) => {
    await apiDeleteReview(id);
    retry();
  };

  return (
    <AdminShell precision searchPlaceholder="Search reviews, products, or users..." user="office">
      <main className="reviews-screen">
        <header className="reviews-heading">
          <div>
            <h1>Reviews &amp; Moderation</h1>
            <p>Manage customer feedback and maintain product quality standards.</p>
          </div>
          <div className="reviews-heading-actions">
            <button type="button">Export</button>
            <button className="primary" type="button">Bulk Approve</button>
          </div>
        </header>

        <section className="review-metrics" aria-label="Review statistics">
          {reviewMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className="review-metric-card" key={metric.title}>
                <div className="review-metric-topline">
                  <span className={`review-metric-icon ${metric.tone === 'danger' ? 'danger' : ''}`}><Icon aria-hidden="true" /></span>
                  <span className={`review-metric-badge ${metric.tone === 'danger' ? 'danger' : ''}`}>{metric.badge}</span>
                </div>
                <h2>{metric.title}</h2>
                <div className="review-metric-value">
                  <strong>{metric.value}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <div className="reviews-workspace">
          <div className="reviews-list-column">
            <section className="review-table-card" aria-label="Customer reviews">
              {state === 'loading' ? (
                <div className="review-state">
                  {Array.from({ length: 4 }).map((_, index) => <span key={index} className="review-state-skeleton" />)}
                </div>
              ) : reviews.length > 0 ? (
                <div className="review-table-scroll">
                  <table className="review-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th className="review-actions-heading">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr
                          className={currentReview?.id === review.id ? 'selected' : ''}
                          key={review.id}
                          onClick={() => setSelectedId(review.id)}
                          tabIndex={0}
                          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(review.id); } }}
                        >
                          <td>
                            <div className="review-product">
                              <img alt="" src={review.productImage} />
                              <div><span>{review.product}</span><small>{review.date}</small></div>
                            </div>
                          </td>
                          <td><strong>{review.customer}</strong><small>Verified Purchase</small></td>
                          <td><ReviewStars rating={review.rating} /></td>
                          <td><span className={`review-status ${review.status.toLowerCase()}`}>{review.status}</span></td>
                          <td>
                            <div className="review-row-actions">
                              {review.status === 'PENDING' ? (
                                <button type="button" onClick={(event) => { event.stopPropagation(); moderateHandler(review.id, 'APPROVED'); }} title="Approve review"><CheckCircle2 aria-hidden="true" /></button>
                              ) : null}
                              <button type="button" onClick={(event) => { event.stopPropagation(); moderateHandler(review.id, 'FLAGGED'); }} title="Flag review"><Flag aria-hidden="true" /></button>
                              <button type="button" onClick={(event) => { event.stopPropagation(); deleteHandler(review.id); }} title="Delete review"><Trash2 aria-hidden="true" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <AdminResourceState className="review-state" emptyDescription="Filter by product, user, or moderation status to surface more reviews." emptyTitle="No reviews found" icon={MessageSquare} secondaryText="Review moderation data appears once the backend stream is connected." state="empty" />
              )}
              <div className="review-table-footer">
                <span>Showing {reviews.length} reviews</span>
                <div>
                  <button type="button">‹</button>
                  <button className="next" type="button">›</button>
                </div>
              </div>
            </section>
          </div>

          {currentReview ? (
            <aside className="review-detail" aria-label="Review detail">
              <header>
                <h2>Review Detail</h2>
                <button type="button" aria-label="Close detail panel" onClick={() => setSelectedId(undefined)}><X aria-hidden="true" /></button>
              </header>
              <div className="review-detail-product">
                <img alt="" src={currentReview.productImage} />
                <div>
                  <strong>{currentReview.product}</strong>
                  <span>Product ID: {currentReview.id}</span>
                  <ReviewStars rating={currentReview.rating} />
                </div>
              </div>
              <div className="review-customer">
                <span className="review-avatar">{currentReview.customerInitials}</span>
                <div>
                  <strong>{currentReview.customer}</strong>
                  <span>{currentReview.date}</span>
                  <span><span className={`review-status ${currentReview.status.toLowerCase()}`}>{currentReview.status}</span></span>
                </div>
              </div>
              <blockquote>{currentReview.comment}</blockquote>
              <label className="review-response-label">Admin Response</label>
              <textarea placeholder="Write a response to this review..." />
              <div className="review-detail-actions">
                <button className="primary" type="button" onClick={() => moderateHandler(currentReview.id, 'APPROVED')}>Approve Review</button>
                <button type="button" onClick={() => deleteHandler(currentReview.id)}>Delete</button>
              </div>
              <p>Changes are saved immediately and visible to customers.</p>
            </aside>
          ) : null}
        </div>
      </main>
    </AdminShell>
  );
};

export default ReviewsPage;
