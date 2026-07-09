const { genId } = require('@freshmart/shared').utils.id;
const { BadRequestError, NotFoundError } = require('@freshmart/shared').errors;
const sharedLogger = require('@freshmart/shared').logger;
const adminRepository = require('../repositories/admin.repository');
const {
  publishAdminConfigUpdated,
  publishAdminDashboardUpdated,
} = require('../events/publisher');

const logger = sharedLogger.child({ service: 'admin-service' });

const DASHBOARD_ENTITY = 'DASHBOARD';
const CONFIG_ENTITY = 'CONFIG';
const AUDIT_ENTITY = 'AUDIT';
const DASHBOARD_ITEM_ID = 'CURRENT';

const DEFAULT_DASHBOARD = () => ({
  totalOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  totalRevenue: 0,
  failedPayments: 0,
  lowStockEvents: 0,
  notificationsSent: 0,
  analyticsUpdates: 0,
  dailyReportsGenerated: 0,
  userRegistrations: 0,
  lastEventType: null,
  lastEventId: null,
  lastUpdatedAt: null,
});

const normalizeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const buildDashboardData = (current = {}, delta = {}, context = {}) => {
  const base = {
    ...DEFAULT_DASHBOARD(),
    ...(current || {}),
  };
  const next = { ...base };

  for (const [key, value] of Object.entries(delta)) {
    next[key] = normalizeNumber(next[key]) + normalizeNumber(value);
  }

  next.lastEventType = context.eventType || next.lastEventType || null;
  next.lastEventId = context.eventId || next.lastEventId || null;
  next.lastUpdatedAt = context.timestamp || new Date().toISOString();

  return next;
};

const resolveEventDate = (payload = {}, context = {}) =>
  (payload?.date || payload?.reportDate || context.timestamp || new Date().toISOString()).slice(0, 10);

const writeAudit = async (eventType, payload, context = {}, status = 'RECORDED') => {
  const audit = await adminRepository.saveEntity({
    entityType: AUDIT_ENTITY,
    itemId: context.eventId || genId('AUDIT'),
    data: {
      eventType,
      payload,
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      source: context.source || 'admin-service',
    },
    status,
    createdBy: context.createdBy || 'system',
  });
  return audit;
};

const updateDashboard = async (delta, context = {}, eventType = null) => {
  const current = await adminRepository.getEntity(DASHBOARD_ENTITY, DASHBOARD_ITEM_ID);
  const nextData = buildDashboardData(current?.data || DEFAULT_DASHBOARD(), delta, {
    ...context,
    eventType,
  });

  const dashboard = await adminRepository.saveEntity({
    entityType: DASHBOARD_ENTITY,
    itemId: DASHBOARD_ITEM_ID,
    data: nextData,
    status: 'ACTIVE',
    createdBy: context.createdBy || 'system',
  });

  await publishAdminDashboardUpdated(
    {
      dashboard,
      delta,
      eventType,
    },
    { ...context, source: 'admin-service' }
  );

  return dashboard;
};

const handleDomainEvent = async (eventType, payload = {}, context = {}) => {
  const eventPayload = payload || {};
  let delta = {};

  if (eventType === 'OrderPlaced.v1') {
    delta = { totalOrders: 1 };
  } else if (eventType === 'OrderCompleted.v1') {
    delta = { completedOrders: 1 };
  } else if (eventType === 'OrderCancelled.v1') {
    delta = { cancelledOrders: 1 };
  } else if (eventType === 'PaymentSuccess.v1') {
    delta = { totalRevenue: normalizeNumber(eventPayload.payment?.amount) };
  } else if (eventType === 'PaymentFailed.v1') {
    delta = { failedPayments: 1 };
  } else if (eventType === 'InventoryLow.v1' || eventType === 'InventoryOutOfStock.v1') {
    delta = { lowStockEvents: 1 };
  } else if (eventType === 'NotificationDelivered.v1') {
    delta = { notificationsSent: 1 };
  } else if (eventType === 'AnalyticsUpdated.v1') {
    delta = { analyticsUpdates: 1 };
  } else if (eventType === 'DailyReportGenerated.v1') {
    delta = { dailyReportsGenerated: 1 };
  } else if (eventType === 'UserRegistered.v1') {
    delta = { userRegistrations: 1 };
  } else {
    throw new BadRequestError(`Unsupported admin event type: ${eventType}`);
  }

  logger.info('Processing admin event', {
    eventId: context.eventId || null,
    eventType,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  const audit = await writeAudit(eventType, eventPayload, context);
  const dashboard = await updateDashboard(delta, context, eventType);

  return {
    audit,
    dashboard,
  };
};

const getDashboard = async () => {
  const dashboard = await adminRepository.getEntity(DASHBOARD_ENTITY, DASHBOARD_ITEM_ID);
  if (!dashboard) {
    return {
      adminItemId: DASHBOARD_ITEM_ID,
      entityType: DASHBOARD_ENTITY,
      data: DEFAULT_DASHBOARD(),
      status: 'ACTIVE',
      createdAt: null,
      updatedAt: null,
      createdBy: null,
      version: 0,
    };
  }
  return dashboard;
};

const listDashboardSnapshots = async () => adminRepository.listByEntityType(DASHBOARD_ENTITY);

const getConfig = async () => {
  const configs = await adminRepository.listByEntityType(CONFIG_ENTITY);
  return configs;
};

const updateConfig = async (payload = {}, context = {}) => {
  const itemId = payload.configKey || payload.itemId || 'DEFAULT';
  if (!payload.data || typeof payload.data !== 'object') {
    throw new BadRequestError('Config data must be an object');
  }

  const config = await adminRepository.saveEntity({
    entityType: CONFIG_ENTITY,
    itemId,
    data: payload.data,
    status: payload.status || 'ACTIVE',
    createdBy: context.createdBy || context.userId || 'system',
  });

  const audit = await writeAudit('AdminConfigUpdated.v1', { config }, context);
  await publishAdminConfigUpdated(
    {
      config,
      audit,
    },
    { ...context, source: 'admin-service' }
  );

  return config;
};

const getAudit = async ({ status = null, eventType = null } = {}) => {
  let items = status ? await adminRepository.listByStatus(status) : await adminRepository.listByEntityType(AUDIT_ENTITY);
  items = items.filter((item) => item.entityType === AUDIT_ENTITY);
  if (eventType) {
    items = items.filter((item) => item.data?.eventType === eventType);
  }
  return items;
};

const deleteConfig = async (itemId = 'DEFAULT') => adminRepository.deleteEntity(CONFIG_ENTITY, itemId);

const getHealth = async () => ({
  service: 'admin-service',
  status: 'ok',
  timestamp: new Date().toISOString(),
});

module.exports = {
  DASHBOARD_ENTITY,
  CONFIG_ENTITY,
  AUDIT_ENTITY,
  DASHBOARD_ITEM_ID,
  DEFAULT_DASHBOARD,
  handleDomainEvent,
  getDashboard,
  listDashboardSnapshots,
  getConfig,
  updateConfig,
  getAudit,
  deleteConfig,
  getHealth,
  updateDashboard,
  writeAudit,
};
