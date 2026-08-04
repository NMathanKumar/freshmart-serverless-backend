const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/service-shared').middleware;
const reservationController = require('../controllers/reservation.controller');
const Joi = require('joi');

const router = express.Router();

const reserveStockSchema = Joi.object({
  productId: Joi.string().required(),
  warehouseId: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  orderId: Joi.string().required(),
});

const productIdSchema = Joi.object({
  productId: Joi.string().required(),
});

const reservationIdParamSchema = Joi.object({
  reservationId: Joi.string().required(),
});

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SYSTEM'),
  validate(reserveStockSchema),
  reservationController.reserveStock
);

router.post(
  '/:reservationId/commit',
  authenticate,
  authorize('ADMIN', 'SYSTEM'),
  validate(reservationIdParamSchema, 'params'),
  validate(productIdSchema),
  reservationController.commitStock
);

router.post(
  '/:reservationId/release',
  authenticate,
  authorize('ADMIN', 'SYSTEM'),
  validate(reservationIdParamSchema, 'params'),
  validate(productIdSchema),
  reservationController.releaseReservation
);

module.exports = router;
