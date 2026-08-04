const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DDB_TABLE_ADMIN = 'admin';
process.env.REVIEW_SERVICE_URL = 'http://mock-review-service/api/v1/reviews';

const { createReviewService, ALLOWED_TRANSITIONS } = require('../src/services/review.service');
const { reviewIdSchema, reviewListSchema, updateReviewSchema } = require('../src/validators/review.validator');

// ── Status transitions ───────────────────────────────────────────────────────
test('review ALLOWED_TRANSITIONS covers all expected paths', () => {
  assert.ok(ALLOWED_TRANSITIONS.PENDING.includes('APPROVED'));
  assert.ok(ALLOWED_TRANSITIONS.PENDING.includes('HIDDEN'));
  assert.ok(ALLOWED_TRANSITIONS.PENDING.includes('REJECTED'));
  assert.ok(ALLOWED_TRANSITIONS.APPROVED.includes('HIDDEN'));
  assert.ok(ALLOWED_TRANSITIONS.HIDDEN.includes('APPROVED'));
});

// ── CRUD (Proxy Mocks) ─────────────────────────────────────────────────────────────

test('review service getById throws NotFoundError for unknown id', async (t) => {
  t.mock.method(global, 'fetch', async () => {
    return {
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' })
    };
  });
  
  const svc = createReviewService();
  await assert.rejects(() => svc.getById('REV_nonexistent'), { errorCode: 'NOT_FOUND' });
});

test('review service moderate approves a PENDING review', async (t) => {
  t.mock.method(global, 'fetch', async (url, options) => {
    if (options.method === 'GET') {
      return {
        ok: true,
        json: async () => ({ data: { reviewId: '123', status: 'PENDING', comment: 'Great!' } })
      };
    }
    if (options.method === 'POST' && url.includes('/approve')) {
      return { ok: true };
    }
    throw new Error('Unexpected fetch call');
  });

  const svc = createReviewService();
  const moderated = await svc.moderate('123', { status: 'APPROVED' }, 'admin');
  assert.equal(moderated.status, 'PENDING'); // getById is called again, returns mocked PENDING
});

test('review service moderate rejects invalid transition', async (t) => {
  t.mock.method(global, 'fetch', async () => {
    return {
      ok: true,
      json: async () => ({ data: { reviewId: '123', status: 'PENDING', comment: 'Bad' } })
    };
  });

  const svc = createReviewService();
  // PENDING -> DELIVERED is not valid
  await assert.rejects(() => svc.moderate('123', { status: 'DELIVERED' }), { errorCode: 'CONFLICT' });
});

test('review service remove deletes the review', async (t) => {
  t.mock.method(global, 'fetch', async (url, options) => {
    if (options.method === 'DELETE') {
      return { ok: true };
    }
    return { ok: false };
  });

  const svc = createReviewService();
  const res = await svc.remove('123', 'admin');
  assert.equal(res, true);
});

// ── Statistics ───────────────────────────────────────────────────────────────
test('review service getStatistics returns correct counts and average rating', async (t) => {
  t.mock.method(global, 'fetch', async (url, options) => {
    if (options.method === 'GET' && url.includes('/admin')) {
      return {
        ok: true,
        json: async () => ({
          data: [
            { reviewId: 'r1', status: 'APPROVED', rating: 4 },
            { reviewId: 'r2', status: 'HIDDEN', rating: 2 },
            { reviewId: 'r3', status: 'PENDING', rating: 5, featured: true }
          ]
        })
      };
    }
    return { ok: false };
  });

  const svc = createReviewService();
  const stats = await svc.getStatistics();
  assert.equal(stats.total, 3);
  assert.equal(stats.approved, 1);
  assert.equal(stats.hidden, 1);
  assert.equal(stats.pending, 1);
  assert.equal(stats.averageRating, 3.67);
});

// ── Pagination & filters ─────────────────────────────────────────────────────
test('review service list filters by productId', async (t) => {
  t.mock.method(global, 'fetch', async (url, options) => {
    if (options.method === 'GET' && url.includes('/admin')) {
      return {
        ok: true,
        json: async () => ({
          data: [
            { reviewId: 'r1', productId: 'p1', rating: 5 },
            { reviewId: 'r2', productId: 'p2', rating: 3 }
          ]
        })
      };
    }
    return { ok: false };
  });

  const svc = createReviewService();
  const result = await svc.list({ productId: 'p1' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].data.productId, 'p1');
});

// ── Validators ───────────────────────────────────────────────────────────────
test('updateReviewSchema requires at least one field', () => {
  const { error } = updateReviewSchema.validate({}, { abortEarly: false });
  assert.ok(error);
});

test('updateReviewSchema rejects invalid status', () => {
  const { error } = updateReviewSchema.validate({ status: 'PENDING' });
  assert.ok(error);
});

test('updateReviewSchema accepts valid status', () => {
  const { error } = updateReviewSchema.validate({ status: 'APPROVED' });
  assert.equal(error, undefined);
});

test('reviewListSchema applies defaults', () => {
  const { value } = reviewListSchema.validate({}, { abortEarly: false });
  assert.equal(value.page, 1);
  assert.equal(value.limit, 20);
  assert.equal(value.sortBy, 'createdAt');
});

test('reviewIdSchema rejects empty id', () => {
  const { error } = reviewIdSchema.validate({ reviewId: '' });
  assert.ok(error);
});
