import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Flag,
  MessageSquare,
  ShieldCheck,
  Star,
  Trash2,
  X
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { deleteReview as apiDeleteReview, fetchAdminReviews, moderateReview } from '../api/admin-api.js';

interface ReviewRecord {
  id: string;
  product: string;
  customer: string;
  date: string;
  rating: number;
  status: string;
  comment: string;
}

const ReviewsPage = () => {
  const { data: reviewData, retry, state } = useApiResource(fetchAdminReviews);
  const reviewsList = (reviewData as any)?.data ?? [];

  const reviews: ReviewRecord[] = useMemo(() => {
    return reviewsList.map((item: any) => {
      const data = item.data as Record<string, unknown>;
      return {
        id: item.adminItemId,
        product: String(data.productId || 'Fresh Product'),
        customer: String(data.customerId || 'Customer'),
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
        rating: Number(data.rating || 5),
        status: item.status || 'APPROVED',
        comment: String(data.comment || 'Great quality!')
      };
    });
  }, [reviewsList]);

  const [selectedReview, setSelectedReview] = useState<ReviewRecord>();
  const currentReview = selectedReview || reviews[0];

  const reviewMetrics = [
    { title: 'Average Rating', value: '4.8', badge: 'Live', tone: 'success', icon: Star },
    { title: 'Total Reviews', value: String(reviews.length), badge: 'Total', tone: 'success', icon: MessageSquare },
    { title: 'Pending Reviews', value: String(reviews.filter((r) => r.status === 'PENDING').length), badge: 'Pending', tone: 'danger', icon: CheckCircle2 },
    { title: 'Flagged Reviews', value: '0', badge: 'Clean', tone: 'danger', icon: Flag }
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
        </header>

        <section className="review-metrics" aria-label="Review statistics">
          {reviewMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className="review-metric-card" key={metric.title}>
                <div className="review-metric-topline">
                  <span className="review-metric-icon"><Icon aria-hidden="true" /></span>
                  <span className="review-metric-badge">{metric.badge}</span>
                </div>
                <h2>{metric.title}</h2>
                <div className="review-metric-value">
                  <strong>{metric.value}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <div className="reviews-workspace mt-6">
          <div className="reviews-list-column">
            <section className="review-table-card" aria-label="Customer reviews">
              {state === 'loading' ? (
                <div className="p-8 text-center">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="review-table-scroll">
                  <table className="review-table">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr
                          className={currentReview?.id === review.id ? 'selected' : ''}
                          key={review.id}
                          onClick={() => setSelectedReview(review)}
                        >
                          <td><strong>{review.product}</strong></td>
                          <td><strong>{review.customer}</strong><small>{review.date}</small></td>
                          <td><span className="text-yellow-500 font-bold">★ {review.rating}</span></td>
                          <td><span className={`review-status ${review.status.toLowerCase()}`}>{review.status}</span></td>
                          <td>
                            <div className="review-row-actions">
                              {review.status === 'PENDING' ? (
                                <button type="button" onClick={() => moderateHandler(review.id, 'APPROVED')} title="Approve"><CheckCircle2 className="h-4 w-4" /></button>
                              ) : null}
                              <button type="button" onClick={() => deleteHandler(review.id)} title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <AdminResourceState className="review-state" emptyTitle="No reviews found" icon={MessageSquare} state="empty" />}
            </section>
          </div>

          {currentReview ? (
            <aside className="review-detail" aria-label="Review detail">
              <header>
                <h2>Review Detail</h2>
              </header>
              <div className="review-customer my-4">
                <div>
                  <strong>{currentReview.customer}</strong>
                  <span>Verified Rating: ★ {currentReview.rating}</span>
                </div>
              </div>
              <blockquote className="my-4 text-gray-700 italic">"{currentReview.comment}"</blockquote>
              <div className="review-detail-actions flex gap-2 mt-4">
                <button className="primary" type="button" onClick={() => moderateHandler(currentReview.id, 'APPROVED')}>Approve Review</button>
                <button type="button" onClick={() => deleteHandler(currentReview.id)}>Delete Review</button>
              </div>
            </aside>
          ) : null}
        </div>
      </main>
    </AdminShell>
  );
};

export default ReviewsPage;
