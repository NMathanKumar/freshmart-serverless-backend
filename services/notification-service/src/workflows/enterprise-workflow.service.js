const logger = require('@freshmart/service-shared').logger;
const { BadRequestError } = require('@freshmart/service-shared').errors;
const config = require('@freshmart/service-shared').config;
const {
  publishImageProcessed,
  publishInvoiceUploaded,
  publishDailyReportGenerated,
  publishRestockJobQueued,
} = require('../events/publishers');
const s3Service = require('@freshmart/service-shared').integrations.s3;
const menuService = require('@freshmart/service-shared').integrations.menu;
const snsService = require('@freshmart/service-shared').integrations.sns;
const sqsService = require('@freshmart/service-shared').integrations.sqs;

const buildS3ObjectUrl = (bucket, key) => {
  const region = config.aws.region;
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key)}`;
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const isDatabaseUnavailableError = (error) =>
  Boolean(
    error &&
      (error.code === 'ECONNREFUSED' ||
        error.code === 'ER_ACCESS_DENIED_ERROR' ||
        error.code === 'ER_BAD_DB_ERROR' ||
        error.code === 'ER_NO_SUCH_TABLE' ||
        String(error.message || '').includes('ECONNREFUSED'))
  );

const requireField = (payload, fieldPath, eventType) => {
  const segments = fieldPath.split('.');
  let current = payload;
  for (const segment of segments) {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
    } else {
      current = undefined;
      break;
    }
  }

  if (current === undefined || current === null || current === '') {
    throw new BadRequestError(`Invalid payload for '${eventType}'. Missing required field: ${fieldPath}`);
  }

  return current;
};

const validateImagePayload = (payload, eventType) => {
  const contentType = requireField(payload, 'contentType', eventType);
  if (!String(contentType).startsWith('image/')) {
    throw new BadRequestError(`Invalid payload for '${eventType}'. contentType must be an image type`);
  }
  requireField(payload, 'foodId', eventType);
  requireField(payload, 'bucket', eventType);
  requireField(payload, 'key', eventType);
};

const generateThumbnailPlaceholder = (foodId, key) => {
  const thumbnailKey = `thumbnails/${foodId}/${key.split('/').pop()}`;
  return {
    thumbnailKey,
    thumbnailUrl: buildS3ObjectUrl('mock-thumbnails', thumbnailKey),
  };
};

const extractMetadataPlaceholder = (payload) => ({
  contentType: payload.contentType,
  size: payload.size || null,
  uploadedBy: payload.uploadedBy || null,
});

const buildInvoiceBody = (payment, invoice) =>
  Buffer.from(
    [
      'FreshMart Invoice',
      `Invoice ID: ${invoice.invoiceId}`,
      `Payment ID: ${payment.paymentId}`,
      `Order ID: ${payment.orderId}`,
      `Amount: ${payment.amount}`,
      `Generated At: ${new Date().toISOString()}`,
    ].join('\n')
  );

const buildDailyReportBody = (reportDate) =>
  Buffer.from(
    [
      'reportDate,metric,value',
      `${reportDate},orders,0`,
      `${reportDate},payments,0`,
      `${reportDate},inventoryAlerts,0`,
    ].join('\n')
  );

const processFoodImageObjectCreated = async (payload, context = {}) => {
  validateImagePayload(payload, context.eventType || 'S3ObjectCreated');

  const imageUrl = normalizeString(payload.imageUrl) || buildS3ObjectUrl(payload.bucket, payload.key);
  const thumbnail = generateThumbnailPlaceholder(payload.foodId, payload.key);
  const metadata = extractMetadataPlaceholder(payload);

  logger.info('Processing food image upload', {
    foodId: payload.foodId,
    bucket: payload.bucket,
    key: payload.key,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  const updatedFood = await menuService.updateFood(
    payload.foodId,
    { imageUrl },
    { ...context, source: 'enterprise-workflow.service' }
  ).catch((error) => {
    if (!isDatabaseUnavailableError(error)) throw error;
    logger.warn('Falling back to mock food update during image workflow', {
      foodId: payload.foodId,
      error: error.message,
    });
    return {
      foodId: payload.foodId,
      imageUrl,
      thumbnail,
      metadata,
      mocked: true,
    };
  });

  await publishImageProcessed(
    {
      foodId: payload.foodId,
      imageUrl,
      thumbnail,
      metadata,
      food: updatedFood,
    },
    { ...context, source: 'enterprise-workflow.service' }
  );

  return {
    imageUrl,
    thumbnail,
    metadata,
    food: updatedFood,
  };
};

const processOrderPlaced = async (payload, context = {}) => {
  const order = payload.order || payload;
  if (!order || !order.orderId) {
    throw new BadRequestError(`Invalid payload for 'OrderPlaced'. Missing required field: order.orderId`);
  }

  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) {
    throw new BadRequestError(`Invalid payload for 'OrderPlaced'. Missing required field: order.items`);
  }

  const inventorySnapshots = items.map((item) => ({
    inventoryId: item.inventoryId || null,
    foodId: item.foodId || item.productId || null,
    currentStock: item.currentStock ?? null,
    minimumStock: item.minimumStock ?? null,
    mocked: item.inventoryId ? false : true,
  }));

  await snsService.publishOrderPlacedNotification({
    orderId: order.orderId,
    userId: order.userId || null,
    itemCount: items.length,
    totalAmount: order.totalAmount || null,
    correlationId: context.correlationId || null,
  });

  await sqsService.enqueueAnalyticsJob({
    jobType: 'ORDER_PLACED',
    orderId: order.orderId,
    userId: order.userId || null,
    itemCount: items.length,
    totalAmount: order.totalAmount || null,
    correlationId: context.correlationId || null,
  });

  return {
    orderId: order.orderId,
    inventorySnapshots,
  };
};

const processInventoryOutOfStock = async (payload, context = {}) => {
  const inventory = payload.inventory || payload;
  if (!inventory || !inventory.foodId) {
    throw new BadRequestError(
      `Invalid payload for 'InventoryOutOfStock'. Missing required field: inventory.foodId`
    );
  }

  logger.info('Processing out-of-stock workflow', {
    foodId: inventory.foodId,
    inventoryId: inventory.inventoryId || null,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  await menuService.setAvailability(
    inventory.foodId,
    false,
    { ...context, source: 'enterprise-workflow.service' }
  ).catch((error) => {
    if (!isDatabaseUnavailableError(error)) throw error;
    logger.warn('Falling back to mock availability update during out-of-stock workflow', {
      foodId: inventory.foodId,
      error: error.message,
    });
    return {
      foodId: inventory.foodId,
      available: false,
      mocked: true,
    };
  });

  await snsService.publishLowStock({
    inventoryId: inventory.inventoryId || null,
    foodId: inventory.foodId,
    currentStock: 0,
    minimumStock: inventory.minimumStock || null,
    correlationId: context.correlationId || null,
  });

  await sqsService.enqueueInventoryEvent({
    jobType: 'RESTOCK',
    inventoryId: inventory.inventoryId || null,
    foodId: inventory.foodId,
    currentStock: 0,
    minimumStock: inventory.minimumStock || null,
    correlationId: context.correlationId || null,
  });

  await publishRestockJobQueued(
    {
      inventoryId: inventory.inventoryId || null,
      foodId: inventory.foodId,
      correlationId: context.correlationId || null,
    },
    { ...context, source: 'enterprise-workflow.service' }
  );

  return {
    foodId: inventory.foodId,
    restockQueued: true,
  };
};

const processPaymentSuccess = async (payload, context = {}) => {
  const payment = payload.payment || payload;
  if (!payment || !payment.paymentId || !payment.orderId) {
    throw new BadRequestError(
      `Invalid payload for 'PaymentSuccess'. Missing required field(s): payment.paymentId, payment.orderId`
    );
  }

  const invoiceId = `INV_${payment.paymentId}`;
  const invoiceBody = buildInvoiceBody(payment, { invoiceId });
  const invoiceKey = `invoices/${payment.orderId}/${invoiceId}.pdf`;
  const invoice = await s3Service.uploadInvoice({
    key: invoiceKey,
    body: invoiceBody,
    contentType: 'application/pdf',
    metadata: {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      correlationId: context.correlationId || '',
    },
  });

  await publishInvoiceUploaded(
    {
      payment,
      invoice,
    },
    { ...context, source: 'enterprise-workflow.service' }
  );

  await snsService.publishPaymentSuccess({
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    invoiceId,
    invoiceKey: invoice.key,
    correlationId: context.correlationId || null,
  });

  await sqsService.enqueueAnalyticsJob({
    jobType: 'INVOICE_UPLOADED',
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    invoiceId,
    invoiceKey: invoice.key,
    correlationId: context.correlationId || null,
  });

  return {
    invoiceId,
    invoice,
  };
};

const processDailyAnalyticsScheduled = async (payload, context = {}) => {
  const reportDate = normalizeString(payload.reportDate) || new Date().toISOString().slice(0, 10);
  const reportBody = buildDailyReportBody(reportDate);
  const reportKey = `reports/daily/${reportDate}.csv`;
  const report = await s3Service.uploadReport({
    key: reportKey,
    body: reportBody,
    contentType: 'text/csv',
    metadata: {
      reportDate,
      correlationId: context.correlationId || '',
    },
  });

  await publishDailyReportGenerated(
    {
      reportDate,
      report,
    },
    { ...context, source: 'enterprise-workflow.service' }
  );

  await snsService.publishReportNotification({
    reportDate,
    reportKey: report.key,
    correlationId: context.correlationId || null,
  });

  return {
    reportDate,
    report,
  };
};

module.exports = {
  processFoodImageObjectCreated,
  processOrderPlaced,
  processInventoryOutOfStock,
  processPaymentSuccess,
  processDailyAnalyticsScheduled,
  buildS3ObjectUrl,
};
