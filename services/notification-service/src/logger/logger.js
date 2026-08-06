const sharedLogger = require('@freshmart/service-shared').logger;

/**
 * Structured Telemetry & CloudWatch Logger for Notification Service
 * Enforces structured JSON logging with correlationId, requestId, eventId, latency, & status
 */
const createTelemetryLogger = (context = {}) => {
  const baseLogger = sharedLogger.child({
    service: 'notification-service',
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
    eventId: context.eventId || null,
    notificationId: context.notificationId || null,
  });

  return {
    info: (message, meta = {}) => {
      baseLogger.info(message, {
        timestamp: new Date().toISOString(),
        ...meta,
      });
    },

    warn: (message, meta = {}) => {
      baseLogger.warn(message, {
        timestamp: new Date().toISOString(),
        ...meta,
      });
    },

    error: (message, meta = {}) => {
      baseLogger.error(message, {
        timestamp: new Date().toISOString(),
        ...meta,
      });
    },

    metric: (metricName, value, unit = 'Count', extraDimensions = {}) => {
      baseLogger.info(`[METRIC] ${metricName}`, {
        _aws: {
          Timestamp: Date.now(),
          CloudWatchMetrics: [
            {
              Namespace: 'FreshMart/NotificationService',
              Dimensions: [['Service', 'Environment'], ...Object.keys(extraDimensions).map((k) => ['Service', k])],
              Metrics: [{ Name: metricName, Unit: unit }],
            },
          ],
        },
        Service: 'notification-service',
        Environment: process.env.NODE_ENV || 'dev',
        [metricName]: value,
        ...extraDimensions,
      });
    },
  };
};

module.exports = {
  createTelemetryLogger,
};
