const { errors } = require('@freshmart/service-shared');
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:3000/api/v1/reviews';

const ENTITY_TYPE = 'REVIEW';

const ALLOWED_TRANSITIONS = {
  PENDING: ['APPROVED', 'HIDDEN', 'REJECTED'],
  APPROVED: ['HIDDEN', 'REJECTED'],
  HIDDEN: ['APPROVED', 'REJECTED'],
  REJECTED: ['APPROVED', 'HIDDEN'],
};

const mapToAdminReview = (rev) => ({
  adminItemId: rev.reviewId,
  entityType: ENTITY_TYPE,
  data: {
    productId: rev.productId,
    customerId: rev.customerId,
    rating: rev.rating,
    title: rev.title,
    comment: rev.comment,
    images: rev.images,
    verifiedPurchase: rev.verifiedPurchase,
    adminNote: rev.adminNote
  },
  status: rev.status || 'PENDING',
  createdAt: rev.createdAt,
  updatedAt: rev.updatedAt,
  createdBy: rev.customerId || 'customer',
  updatedBy: rev.updatedBy || rev.customerId || 'customer',
});

const createReviewService = () => {
  const getHeaders = (userId) => ({
    'Content-Type': 'application/json',
    ...(userId && { 'X-Admin-User-Id': userId })
  });

  const list = async (query = {}) => {
    const url = new URL(`${REVIEW_SERVICE_URL}/admin`);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch reviews from review-service');
    const data = await response.json();
    const items = data.data || [];
    
    // In-memory filter for now to support admin generic filters
    const { productId, customerId, rating } = query;
    const filtered = items.filter(item => {
      if (productId && item.productId !== productId) return false;
      if (customerId && item.customerId !== customerId) return false;
      if (rating !== undefined && item.rating !== Number(rating)) return false;
      return true;
    });

    const adminItems = filtered.map(mapToAdminReview);
    return {
      items: adminItems,
      page: 1,
      limit: adminItems.length,
      total: adminItems.length,
      totalPages: 1
    };
  };

  const getById = async (id) => {
    const response = await fetch(`${REVIEW_SERVICE_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.status === 404) throw new errors.NotFoundError('Review not found');
    if (!response.ok) throw new Error('Failed to fetch review');
    const data = await response.json();
    return mapToAdminReview(data.data);
  };

  const getStatistics = async () => {
    const all = await list();
    const items = all.items || [];
    const reviews = items.map((item) => item.data || {});
    const total = reviews.length;
    const ratings = reviews.map((r) => Number(r.rating) || 0).filter(Boolean);
    
    return {
      total,
      pending: items.filter((i) => i.status === 'PENDING').length,
      approved: items.filter((i) => i.status === 'APPROVED').length,
      hidden: items.filter((i) => i.status === 'HIDDEN').length,
      rejected: items.filter((i) => i.status === 'REJECTED').length,
      featured: reviews.filter((r) => r.featured).length,
      averageRating: ratings.length ? +(ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2) : 0,
    };
  };

  const moderate = async (id, { status, adminNote }, userId) => {
    const current = await getById(id);
    if (status) {
      const allowed = ALLOWED_TRANSITIONS[current.status] || [];
      if (!allowed.includes(status)) {
        throw new errors.ConflictError(`Cannot transition review from '${current.status}' to '${status}'`);
      }
    }

    if (status === 'APPROVED') {
      const response = await fetch(`${REVIEW_SERVICE_URL}/${id}/approve`, {
        method: 'POST',
        headers: getHeaders(userId)
      });
      if (!response.ok) throw new Error('Failed to approve review');
    } else if (status === 'REJECTED') {
      const response = await fetch(`${REVIEW_SERVICE_URL}/${id}/reject`, {
        method: 'POST',
        headers: getHeaders(userId)
      });
      if (!response.ok) throw new Error('Failed to reject review');
    } else if (status) {
      // For HIDDEN or other statuses, use generic PUT
      const response = await fetch(`${REVIEW_SERVICE_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(userId),
        body: JSON.stringify({ status, adminNote })
      });
      if (!response.ok) throw new Error(`Failed to update review status to ${status}`);
    } else if (adminNote) {
      const response = await fetch(`${REVIEW_SERVICE_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(userId),
        body: JSON.stringify({ adminNote })
      });
      if (!response.ok) throw new Error('Failed to update review adminNote');
    }

    return getById(id);
  };

  const remove = async (id, userId) => {
    const response = await fetch(`${REVIEW_SERVICE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return true;
  };

  return { list, getById, getStatistics, moderate, remove };
};

const service = createReviewService();
module.exports = service;
module.exports.createReviewService = createReviewService;
module.exports.ENTITY_TYPE = ENTITY_TYPE;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;
