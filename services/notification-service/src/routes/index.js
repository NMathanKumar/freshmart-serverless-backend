const express = require('express');
const authenticate = require('@freshmart/service-shared').middleware.authenticate;
const authorize = require('@freshmart/service-shared').middleware.authorize;
const validate = require('@freshmart/service-shared').middleware.validate;
const controller = require('../controllers/notification.controller');
const {
  createNotificationSchema,
  markFailedSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/notification.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listQuerySchema, 'query'), controller.listNotifications);
router.get('/:id', validate(idParamSchema, 'params'), controller.getNotificationById);
router.post('/', authorize('ADMIN', 'STAFF'), validate(createNotificationSchema), controller.createNotification);
router.patch('/:id/delivered', authorize('ADMIN', 'STAFF'), validate(idParamSchema, 'params'), controller.markDelivered);
router.patch(
  '/:id/failed',
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(markFailedSchema),
  controller.markFailed
);

module.exports = router;
