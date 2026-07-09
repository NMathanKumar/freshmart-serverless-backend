const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success, created, noContent } = require('@freshmart/shared').response;
const productService = require('../services/product.service');

const buildContext = (req) => ({
  correlationId: req.headers['x-correlation-id'] || req.requestId || null,
  requestId: req.requestId || null,
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, buildContext(req));
  created(res, { message: 'Product created', data: product });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  success(res, { message: 'Product fetched', data: product });
});

const listProducts = asyncHandler(async (req, res) => {
  const { limit, cursor, category } = req.query;
  const { items, nextCursor } = await productService.listProducts({ limit, cursor, category });
  success(res, { message: 'Products fetched', data: items, meta: { nextCursor } });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit, cursor } = req.query;
  const { items, nextCursor } = await productService.searchProducts(q, { limit, cursor });
  success(res, { message: 'Search results', data: items, meta: { nextCursor } });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, buildContext(req));
  success(res, { message: 'Product updated', data: product });
});

const setAvailability = asyncHandler(async (req, res) => {
  const product = await productService.setAvailability(
    req.params.id,
    req.body.available,
    buildContext(req)
  );
  success(res, {
    message: `Product marked as ${req.body.available ? 'available' : 'unavailable'}`,
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, buildContext(req));
  noContent(res, { message: 'Product deleted' });
});

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  searchProducts,
  updateProduct,
  setAvailability,
  deleteProduct,
};
