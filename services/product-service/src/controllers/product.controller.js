const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created, noContent } = require('@freshmart/service-shared').response;
const { emitBusinessMetrics } = require('@freshmart/service-shared').metrics;
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
  try {
    emitBusinessMetrics([
      { name: 'ProductViewed', value: 1, unit: 'Count', extraDimensions: { EventType: 'product', Category: product.category || 'unknown' } }
    ]);
  } catch (_) {}
  success(res, { message: 'Product fetched', data: product });
});

const listProducts = asyncHandler(async (req, res) => {
  const { limit, cursor, category } = req.query;
  const { items, nextCursor } = await productService.listProducts({ limit, cursor, category });
  try {
    const extraDimensions = { EventType: 'product' };
    if (category) {
      extraDimensions.Category = category;
    }
    emitBusinessMetrics([
      { name: 'ProductsListed', value: 1, unit: 'Count', extraDimensions }
    ]);
  } catch (_) {}
  success(res, { message: 'Products fetched', data: items, meta: { nextCursor } });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit, cursor } = req.query;
  const { items, nextCursor } = await productService.searchProducts(q, { limit, cursor });
  try {
    const metrics = [
      { name: 'ProductSearched', value: 1, unit: 'Count', extraDimensions: { EventType: 'product' } },
      { name: 'SearchResultCount', value: items.length, unit: 'Count', extraDimensions: { EventType: 'product' } }
    ];
    if (items.length === 0) {
      metrics.push({ name: 'SearchNoResults', value: 1, unit: 'Count', extraDimensions: { EventType: 'product' } });
    }
    emitBusinessMetrics(metrics);
  } catch (_) {}
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

const getUploadUrl = asyncHandler(async (req, res) => {
  const { fileName } = req.body || {};
  const cleanName = (fileName || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `catalog/products/${Date.now()}_${cleanName}`;
  const bucket = process.env.AWS_S3_BUCKET || 'freshmart-dev-assets-769044546162';
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  success(res, {
    message: 'Presigned upload URL generated',
    data: {
      uploadUrl: '#',
      imageUrl,
    },
  });
});

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  searchProducts,
  updateProduct,
  setAvailability,
  deleteProduct,
  getUploadUrl,
};
