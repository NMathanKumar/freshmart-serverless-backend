const { utils, response } = require('@freshmart/service-shared');
const reviewService = require('../services/review.service');

const list = utils.asyncHandler(async (req, res) => {
  const result = await reviewService.list(req.query);
  response.success(res, { message: 'Reviews fetched', data: result.items, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

const getById = utils.asyncHandler(async (req, res) => {
  const item = await reviewService.getById(req.params.reviewId);
  response.success(res, { message: 'Review fetched', data: item });
});

const moderate = utils.asyncHandler(async (req, res) => {
  const item = await reviewService.moderate(req.params.reviewId, req.body);
  response.success(res, { message: 'Review updated', data: item });
});

const remove = utils.asyncHandler(async (req, res) => {
  await reviewService.remove(req.params.reviewId);
  response.success(res, { message: 'Review deleted', data: null });
});

const getStatistics = utils.asyncHandler(async (_req, res) => {
  const stats = await reviewService.getStatistics();
  response.success(res, { message: 'Review statistics fetched', data: stats });
});

module.exports = { list, getById, moderate, remove, getStatistics };
