const { genId } = require('../../core/utils/id');
const { EVENT_TYPES, EVENT_VERSION } = require('../constants');

const now = () => new Date().toISOString();
const eventSource = process.env.AWS_EVENT_SOURCE || 'local.simulator';

const buildSampleEvent = (detailType, detail) => ({
  id: genId('EVT'),
  'detail-type': detailType,
  source: eventSource,
  time: now(),
  detail: {
    eventId: genId('EVT'),
    correlationId: genId('COR'),
    requestId: genId('REQ'),
    timestamp: now(),
    version: EVENT_VERSION,
    payload: detail,
  },
});

const sampleEvents = [
  buildSampleEvent(EVENT_TYPES.S3_OBJECT_CREATED, {
    foodId: 'FOOD_sample',
    bucket: 'freshmart-media-bucket',
    key: 'food-images/FOOD_sample/original.jpg',
    imageUrl: 'https://freshmart-media-bucket.s3.ap-southeast-1.amazonaws.com/food-images/FOOD_sample/original.jpg',
    contentType: 'image/jpeg',
    size: 124500,
    uploadedBy: 'USER_admin',
  }),
  buildSampleEvent(EVENT_TYPES.USER_REGISTERED, {
    user: {
      userId: 'USER_sample',
      email: 'customer@freshmart.com',
      name: 'Sample Customer',
    },
  }),
  buildSampleEvent(EVENT_TYPES.USER_REGISTERED_V1, {
    user: {
      userId: 'USER_sample',
      email: 'customer@freshmart.com',
      name: 'Sample Customer',
    },
  }),
  buildSampleEvent(EVENT_TYPES.FOOD_CREATED, {
    food: {
      foodId: 'FOOD_sample',
      name: 'Veg Biryani',
    },
  }),
  buildSampleEvent(EVENT_TYPES.FOOD_UPDATED, {
    food: {
      foodId: 'FOOD_sample',
      name: 'Veg Biryani Updated',
    },
  }),
  buildSampleEvent(EVENT_TYPES.FOOD_DELETED, {
    foodId: 'FOOD_sample',
    food: {
      foodId: 'FOOD_sample',
      name: 'Veg Biryani',
    },
  }),
  buildSampleEvent(EVENT_TYPES.INVENTORY_UPDATED, {
    inventory: {
      inventoryId: 'INV_sample',
      foodId: 'FOOD_sample',
      currentStock: 12,
      minimumStock: 5,
    },
  }),
  buildSampleEvent(EVENT_TYPES.INVENTORY_LOW, {
    inventory: {
      inventoryId: 'INV_sample',
      foodId: 'FOOD_sample',
      currentStock: 4,
      minimumStock: 5,
    },
  }),
  buildSampleEvent(EVENT_TYPES.INVENTORY_LOW_V1, {
    inventory: {
      inventoryId: 'INV_sample',
      foodId: 'FOOD_sample',
      currentStock: 4,
      minimumStock: 5,
    },
  }),
  buildSampleEvent(EVENT_TYPES.INVENTORY_OUT_OF_STOCK, {
    inventory: {
      inventoryId: 'INV_sample',
      foodId: 'FOOD_sample',
      currentStock: 0,
      minimumStock: 5,
    },
  }),
  buildSampleEvent(EVENT_TYPES.INVENTORY_OUT_OF_STOCK_V1, {
    inventory: {
      inventoryId: 'INV_sample',
      foodId: 'FOOD_sample',
      currentStock: 0,
      minimumStock: 5,
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_PLACED, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'PLACED',
      userId: 'USER_sample',
      totalAmount: 280,
      items: [
        {
          foodId: 'FOOD_sample',
          name: 'Veg Biryani',
          quantity: 2,
          price: 140,
        },
      ],
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_ACCEPTED, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'ACCEPTED',
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_PLACED_V1, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'PLACED',
      userId: 'USER_sample',
      totalAmount: 280,
      items: [
        {
          foodId: 'FOOD_sample',
          name: 'Veg Biryani',
          quantity: 2,
          price: 140,
        },
      ],
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_ACCEPTED_V1, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'ACCEPTED',
      userId: 'USER_sample',
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_CANCELLED, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'CANCELLED',
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_CANCELLED_V1, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'CANCELLED',
      userId: 'USER_sample',
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_READY_V1, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'READY',
      userId: 'USER_sample',
    },
  }),
  buildSampleEvent(EVENT_TYPES.ORDER_COMPLETED_V1, {
    order: {
      orderId: 'ORDER_sample',
      orderStatus: 'DELIVERED',
      userId: 'USER_sample',
    },
  }),
  buildSampleEvent(EVENT_TYPES.PAYMENT_CREATED, {
    payment: {
      paymentId: 'PAY_sample',
      orderId: 'ORDER_sample',
      paymentStatus: 'PENDING',
    },
  }),
  buildSampleEvent(EVENT_TYPES.PAYMENT_SUCCESS, {
    payment: {
      paymentId: 'PAY_sample',
      orderId: 'ORDER_sample',
      paymentStatus: 'SUCCESS',
    },
  }),
  buildSampleEvent(EVENT_TYPES.PAYMENT_SUCCESS_V1, {
    payment: {
      paymentId: 'PAY_sample',
      orderId: 'ORDER_sample',
      userId: 'USER_sample',
      paymentStatus: 'SUCCESS',
    },
  }),
  buildSampleEvent(EVENT_TYPES.PAYMENT_FAILED, {
    payment: {
      paymentId: 'PAY_sample',
      orderId: 'ORDER_sample',
      paymentStatus: 'FAILED',
    },
  }),
  buildSampleEvent(EVENT_TYPES.PAYMENT_FAILED_V1, {
    payment: {
      paymentId: 'PAY_sample',
      orderId: 'ORDER_sample',
      userId: 'USER_sample',
      paymentStatus: 'FAILED',
    },
  }),
  buildSampleEvent(EVENT_TYPES.PAYMENT_REFUNDED, {
    payment: {
      paymentId: 'PAY_sample',
      orderId: 'ORDER_sample',
      paymentStatus: 'REFUNDED',
    },
  }),
  buildSampleEvent(EVENT_TYPES.NOTIFICATION_CREATED_V1, {
    notification: {
      notificationId: 'NOTIF_sample',
      userId: 'USER_sample',
    },
  }),
  buildSampleEvent(EVENT_TYPES.NOTIFICATION_DELIVERED_V1, {
    notification: {
      notificationId: 'NOTIF_sample',
      userId: 'USER_sample',
      createdAt: '2026-07-01T06:00:00.000Z',
    },
  }),
  buildSampleEvent(EVENT_TYPES.NOTIFICATION_FAILED_V1, {
    notification: {
      notificationId: 'NOTIF_sample',
      userId: 'USER_sample',
    },
  }),
  buildSampleEvent(EVENT_TYPES.DAILY_ANALYTICS_SCHEDULED, {
    reportDate: '2026-06-30',
    requestedBy: 'SYSTEM',
  }),
  buildSampleEvent(EVENT_TYPES.DAILY_REPORT_GENERATED_V1, {
    reportDate: '2026-06-30',
    report: {
      reportId: 'RPT_sample',
      reportType: 'DAILY',
    },
  }),
  buildSampleEvent(EVENT_TYPES.ANALYTICS_UPDATED_V1, {
    report: {
      reportId: 'RPT_sample',
      reportType: 'DAILY',
      date: '2026-06-30',
    },
    metricDeltas: {
      totalOrders: 1,
    },
  }),
  buildSampleEvent(EVENT_TYPES.ADMIN_CONFIG_UPDATED_V1, {
    config: {
      adminItemId: 'DEFAULT',
      entityType: 'CONFIG',
      data: {
        featureFlag: true,
      },
    },
  }),
  buildSampleEvent(EVENT_TYPES.ADMIN_DASHBOARD_UPDATED_V1, {
    dashboard: {
      adminItemId: 'CURRENT',
      entityType: 'DASHBOARD',
      data: {
        totalOrders: 1,
      },
    },
  }),
];

module.exports = {
  sampleEvents,
  buildSampleEvent,
};
