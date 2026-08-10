/**
 * Auto-Delivery Handler
 *
 * AWS Lambda handler triggered every 5 minutes via EventBridge Scheduler.
 * Automatically advances order status through the delivery pipeline:
 *   PLACED → PREPARING (after 7.5 min)
 *   PREPARING → READY (after 15 min)
 *   READY → OUT_FOR_DELIVERY (after 22.5 min)
 *   OUT_FOR_DELIVERY → DELIVERED (after 30 min)
 *
 * Each status change fires the relevant EventBridge event, which in turn
 * triggers the notification-service to email the customer.
 */

const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;
const { ORDER_STATUS } = require('@freshmart/service-shared').constants;
const sharedLogger = require('@freshmart/service-shared').logger;
const {
  publishOrderAccepted,
  publishOrderReady,
  publishOrderOutForDelivery,
  publishOrderCompleted,
} = require('../events/publisher');
const orderRepository = require('../repositories/order.repository');

const logger = sharedLogger.child({ service: 'order-service', handler: 'auto-deliver' });

const tableName = () =>
  config.dynamodb.tables.orders || process.env.DDB_TABLE_ORDERS || 'freshmart-dev-orders';

// Time thresholds in minutes for each stage (demo mode: 1, 2, 3, 4 mins)
const STAGE_THRESHOLDS = [
  { fromStatus: ORDER_STATUS.PLACED,            toStatus: ORDER_STATUS.PREPARING,         afterMinutes: 1 },
  { fromStatus: ORDER_STATUS.PREPARING,         toStatus: ORDER_STATUS.READY,              afterMinutes: 2 },
  { fromStatus: ORDER_STATUS.READY,             toStatus: ORDER_STATUS.OUT_FOR_DELIVERY,   afterMinutes: 3 },
  { fromStatus: ORDER_STATUS.OUT_FOR_DELIVERY,  toStatus: ORDER_STATUS.DELIVERED,          afterMinutes: 4 },
];

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

const getAllActiveOrders = async () => {
  const activeStatuses = [
    ORDER_STATUS.PLACED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
  ];

  const result = await documentClient.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'orderStatus IN (:s1, :s2, :s3, :s4)',
      ExpressionAttributeValues: {
        ':s1': activeStatuses[0],
        ':s2': activeStatuses[1],
        ':s3': activeStatuses[2],
        ':s4': activeStatuses[3],
      },
    })
  );

  return result.Items || [];
};

const publishStatusEvent = async (order, toStatus, context) => {
  if (toStatus === ORDER_STATUS.PREPARING) {
    await publishOrderAccepted({ order }, context);
  } else if (toStatus === ORDER_STATUS.READY) {
    await publishOrderReady({ order }, context);
  } else if (toStatus === ORDER_STATUS.OUT_FOR_DELIVERY) {
    await publishOrderOutForDelivery({ order }, context);
  } else if (toStatus === ORDER_STATUS.DELIVERED) {
    await publishOrderCompleted({ order }, context);
  }
};

exports.handler = async (event) => {
  const context = { source: 'auto-deliver-handler', correlationId: `auto-${Date.now()}` };
  logger.info('Auto-deliver handler started', context);

  let processed = 0;
  let errors = 0;

  try {
    const orders = await getAllActiveOrders();
    logger.info(`Found ${orders.length} active orders to evaluate`);

    for (const order of orders) {
      const orderId = order.orderId;
      const currentStatus = order.orderStatus || order.status;
      const createdAt = order.createdAt;

      if (!createdAt) continue;

      const stage = STAGE_THRESHOLDS.find(
        (s) => s.fromStatus === currentStatus && createdAt <= minutesAgo(s.afterMinutes)
      );

      if (!stage) continue;

      try {
        logger.info(`Auto-advancing order ${orderId}: ${stage.fromStatus} → ${stage.toStatus}`);

        const updatedOrder = await orderRepository.updateOrderStatus(orderId, stage.toStatus);
        if (updatedOrder) {
          await publishStatusEvent(updatedOrder, stage.toStatus, context);
          processed++;
          logger.info(`Order ${orderId} advanced to ${stage.toStatus}`);
        }
      } catch (err) {
        errors++;
        logger.error(`Failed to advance order ${orderId}`, {
          error: err.message,
          fromStatus: stage.fromStatus,
          toStatus: stage.toStatus,
        });
      }
    }
  } catch (err) {
    logger.error('Auto-deliver handler failed', { error: err.message });
    throw err;
  }

  const summary = { processed, errors, total: processed + errors };
  logger.info('Auto-deliver handler completed', summary);
  return summary;
};
