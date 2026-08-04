const { utils, response } = require('@freshmart/service-shared');
const categoryService = require('../services/category.service');

const list = utils.asyncHandler(async (req, res) => {
  const result = await categoryService.list(req.query);
  response.success(res, { message: 'Categories fetched', data: result.items, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

const getById = utils.asyncHandler(async (req, res) => {
  const item = await categoryService.getById(req.params.categoryId);
  response.success(res, { message: 'Category fetched', data: item });
});

const create = utils.asyncHandler(async (req, res) => {
  const item = await categoryService.create(req.body, req.user?.userId || 'admin');
  response.created(res, { message: 'Category created', data: item });
});

const update = utils.asyncHandler(async (req, res) => {
  const item = await categoryService.update(req.params.categoryId, req.body);
  response.success(res, { message: 'Category updated', data: item });
});

const remove = utils.asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.categoryId);
  response.success(res, { message: 'Category deleted', data: null });
});

module.exports = { list, getById, create, update, remove };
