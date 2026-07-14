const { genId } = require('@freshmart/service-shared').utils.id;
const { NotFoundError } = require('@freshmart/service-shared').errors;
const baseLogger = require('@freshmart/service-shared').logger;
const createProductRepository = require('../repositories/product.repository');
const {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
  publishProductAvailabilityChanged,
} = require('../events/publisher');

const logger = baseLogger.child({ service: 'product-service' });
const productRepository = createProductRepository();

const safePublish = async (publishFn, payload, context, eventName) => {
  try {
    await publishFn(payload, { ...context, source: 'product-service' });
  } catch (err) {
    logger.warn(`Event publish failed: ${eventName}`, {
      service: 'product-service',
      eventName,
      productId: payload.productId || null,
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      error: err.message,
    });
  }
};

const logProductEvent = (message, productId, context = {}) => {
  logger.info(message, {
    service: 'product-service',
    productId: productId || null,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });
};

const createProduct = async (data, context = {}) => {
  const productId = genId('PROD');
  const product = await productRepository.createProduct(productId, data);
  await safePublish(publishProductCreated, { product }, context, 'PRODUCT_CREATED');
  logProductEvent('Product created', productId, context);
  return product;
};

const getProductById = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new NotFoundError(`Product '${productId}' not found`);
  return product;
};

const listProducts = async ({ limit, cursor, category } = {}) => {
  const { items, nextCursor } = await productRepository.findAll({ limit, cursor, category });
  return { items, nextCursor };
};

const searchProducts = async (term, { limit, cursor } = {}) => {
  const { items, nextCursor } = await productRepository.search(term, { limit, cursor });
  return { items, nextCursor };
};

const updateProduct = async (productId, data, context = {}) => {
  const updatedProduct = await productRepository.updateProduct(productId, data);
  if (!updatedProduct) throw new NotFoundError(`Product '${productId}' not found`);
  await safePublish(publishProductUpdated, { productId, product: updatedProduct }, context, 'PRODUCT_UPDATED');
  logProductEvent('Product updated', productId, context);
  return updatedProduct;
};

const setAvailability = async (productId, available, context = {}) => {
  const updatedProduct = await productRepository.setAvailability(productId, available);
  if (!updatedProduct) throw new NotFoundError(`Product '${productId}' not found`);
  await safePublish(publishProductUpdated, { productId, product: updatedProduct }, context, 'PRODUCT_UPDATED');
  await safePublish(
    publishProductAvailabilityChanged,
    { productId, product: updatedProduct, available: !!available },
    context,
    'PRODUCT_AVAILABILITY_CHANGED'
  );
  logProductEvent('Product availability changed', productId, context);
  return updatedProduct;
};

const deleteProduct = async (productId, context = {}) => {
  const product = await getProductById(productId);
  const deleted = await productRepository.remove(productId);
  if (deleted) {
    await safePublish(publishProductDeleted, { productId, product }, context, 'PRODUCT_DELETED');
    logProductEvent('Product deleted', productId, context);
  }
  return deleted;
};

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  searchProducts,
  updateProduct,
  setAvailability,
  deleteProduct,
};
