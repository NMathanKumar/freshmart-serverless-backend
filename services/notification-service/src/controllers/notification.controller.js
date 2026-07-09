const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success, created } = require('@freshmart/shared').response;
const notificationService = require('../services/notification.service');

const listNotifications = asyncHandler(async (req, res) => {
  const isStaff = ['ADMIN', 'STAFF'].includes(req.user?.role);
  const items = await notificationService.listNotifications({
    userId: req.query.userId || (req.query.status && isStaff ? null : req.user?.userId || null),
    status: req.query.status || null,
  });
  success(res, { message: 'Notifications fetched', data: items });
});

const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id);
  success(res, { message: 'Notification fetched', data: notification });
});

const markDelivered = asyncHandler(async (req, res) => {
  const notification = await notificationService.markDelivered(req.params.id, req.eventContext);
  success(res, { message: 'Notification marked delivered', data: notification });
});

const markFailed = asyncHandler(async (req, res) => {
  const notification = await notificationService.markFailed(
    req.params.id,
    req.body.failureReason,
    req.eventContext
  );
  success(res, { message: 'Notification marked failed', data: notification });
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createAndDeliverNotification({
    ...req.body,
    context: req.eventContext,
  });
  created(res, { message: 'Notification created', data: notification });
});

module.exports = {
  listNotifications,
  getNotificationById,
  markDelivered,
  markFailed,
  createNotification,
};
