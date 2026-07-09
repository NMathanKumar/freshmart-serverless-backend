const { genId } = require('@freshmart/shared').utils.id;
const { BadRequestError, NotFoundError } = require('@freshmart/shared').errors;
const sharedLogger = require('@freshmart/shared').logger;
const analyticsRepository = require('./repositories/report.repository');
const { publishDailyReportGenerated, publishAnalyticsUpdated } = require('./events/publisher');

const logger = sharedLogger.child({ service: 'analytics-service' });

const REPORT_TYPE_DAILY = 'DAILY';

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const candidate = typeof value === 'string' ? value : new Date(value).toISOString();
  return candidate.slice(0, 10);
};

const normalizeAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const buildAnalyticsPayload = (report, metricDeltas = {}, triggerEventType = null) => ({
  report,
  metricDeltas,
  triggerEventType,
});

const persistCounters = async (metricDeltas, context = {}, triggerEventType = null, explicitDate = null) => {
  const reportDate = normalizeDate(
    explicitDate ||
      context.timestamp ||
      metricDeltas.date ||
      null
  );

  const report = await analyticsRepository.upsertCounters({
    reportId: genId('RPT'),
    reportType: REPORT_TYPE_DAILY,
    date: reportDate,
    deltas: metricDeltas,
  });

  await publishAnalyticsUpdated(
    buildAnalyticsPayload(report, metricDeltas, triggerEventType || context.eventType || null),
    { ...context, source: 'analytics-service' }
  );

  return report;
};

const deriveEventDate = (payload = {}, context = {}) => {
  const source =
    payload?.order?.createdAt ||
    payload?.payment?.createdAt ||
    payload?.notification?.createdAt ||
    payload?.inventory?.updatedAt ||
    payload?.user?.createdAt ||
    context.timestamp ||
    null;
  return normalizeDate(source);
};

const handleOrderPlacedEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderPlaced'. Missing required field: order.orderId");
  }

  logger.info('Aggregating OrderPlaced event', {
    eventId: context.eventId || null,
    orderId: order.orderId,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  return persistCounters(
    { totalOrders: 1 },
    context,
    'OrderPlaced.v1',
    deriveEventDate(payload, context)
  );
};

const handleOrderCompletedEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderCompleted'. Missing required field: order.orderId");
  }

  return persistCounters(
    { completedOrders: 1 },
    context,
    'OrderCompleted.v1',
    deriveEventDate(payload, context)
  );
};

const handleOrderCancelledEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderCancelled'. Missing required field: order.orderId");
  }

  return persistCounters(
    { cancelledOrders: 1 },
    context,
    'OrderCancelled.v1',
    deriveEventDate(payload, context)
  );
};

const handlePaymentSuccessEvent = async (payload = {}, context = {}) => {
  const payment = payload.payment || payload;
  if (!payment?.paymentId || !payment?.orderId) {
    throw new BadRequestError("Invalid payload for 'PaymentSuccess'. Missing required field(s): payment.paymentId, payment.orderId");
  }

  return persistCounters(
    { totalRevenue: normalizeAmount(payment.amount) },
    context,
    'PaymentSuccess.v1',
    deriveEventDate(payload, context)
  );
};

const handlePaymentFailedEvent = async (payload = {}, context = {}) => {
  const payment = payload.payment || payload;
  if (!payment?.paymentId || !payment?.orderId) {
    throw new BadRequestError("Invalid payload for 'PaymentFailed'. Missing required field(s): payment.paymentId, payment.orderId");
  }

  return persistCounters(
    { failedPayments: 1 },
    context,
    'PaymentFailed.v1',
    deriveEventDate(payload, context)
  );
};

const handleInventoryLowEvent = async (payload = {}, context = {}) => {
  const inventory = payload.inventory || payload;
  if (!inventory?.productId && !inventory?.foodId) {
    throw new BadRequestError("Invalid payload for 'InventoryLow'. Missing required field: inventory.productId");
  }

  return persistCounters(
    { lowStockEvents: 1 },
    context,
    'InventoryLow.v1',
    deriveEventDate(payload, context)
  );
};

const handleInventoryOutOfStockEvent = async (payload = {}, context = {}) => {
  const inventory = payload.inventory || payload;
  if (!inventory?.productId && !inventory?.foodId) {
    throw new BadRequestError("Invalid payload for 'InventoryOutOfStock'. Missing required field: inventory.productId");
  }

  return persistCounters(
    { lowStockEvents: 1 },
    context,
    'InventoryOutOfStock.v1',
    deriveEventDate(payload, context)
  );
};

const handleNotificationDeliveredEvent = async (payload = {}, context = {}) => {
  const notification = payload.notification || payload;
  if (!notification?.notificationId) {
    throw new BadRequestError("Invalid payload for 'NotificationDelivered'. Missing required field: notification.notificationId");
  }

  return persistCounters(
    { notificationsSent: 1 },
    context,
    'NotificationDelivered.v1',
    deriveEventDate(payload, context)
  );
};

const handleUserRegisteredEvent = async (payload = {}, context = {}) => {
  const user = payload.user || payload;
  if (!user?.userId) {
    throw new BadRequestError("Invalid payload for 'UserRegistered'. Missing required field: user.userId");
  }

  return persistCounters(
    { userRegistrations: 1 },
    context,
    'UserRegistered.v1',
    deriveEventDate(payload, context)
  );
};

const generateDailyReport = async (payload = {}, context = {}) => {
  const reportDate = normalizeDate(payload.reportDate || context.timestamp || null);
  const existing = await analyticsRepository.getReport(REPORT_TYPE_DAILY, reportDate);
  const report =
    existing ||
    (await analyticsRepository.upsertCounters({
      reportId: genId('RPT'),
      reportType: REPORT_TYPE_DAILY,
      date: reportDate,
      deltas: {},
    }));

  await publishDailyReportGenerated(
    {
      reportDate,
      report,
    },
    { ...context, source: 'analytics-service' }
  );

  return report;
};

const getReportByTypeAndDate = async (reportType, date) => {
  const report = await analyticsRepository.getReport(reportType, normalizeDate(date));
  if (!report) {
    throw new NotFoundError(`Analytics report '${reportType}' for '${normalizeDate(date)}' not found`);
  }
  return report;
};

const listReportsByDate = async (date) => analyticsRepository.listByDate(normalizeDate(date));

const getMetricHistory = async (metricName) => analyticsRepository.listMetricHistory(metricName);

module.exports = {
  REPORT_TYPE_DAILY,
  handleOrderPlacedEvent,
  handleOrderCompletedEvent,
  handleOrderCancelledEvent,
  handlePaymentSuccessEvent,
  handlePaymentFailedEvent,
  handleInventoryLowEvent,
  handleInventoryOutOfStockEvent,
  handleNotificationDeliveredEvent,
  handleUserRegisteredEvent,
  generateDailyReport,
  getReportByTypeAndDate,
  listReportsByDate,
  getMetricHistory,
};
