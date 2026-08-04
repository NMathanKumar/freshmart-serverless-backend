const reservationService = require('../services/reservation.service');
const { SuccessResponse } = require('@freshmart/service-shared').responses;

const reserveStock = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, orderId } = req.body;
    const result = await reservationService.reserveStock(productId, warehouseId, quantity, orderId);
    return res.status(201).json(new SuccessResponse(result, 'Stock reserved successfully').toFormat());
  } catch (error) {
    next(error);
  }
};

const commitStock = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { reservationId } = req.params;
    const result = await reservationService.commitStock(reservationId, productId);
    return res.status(200).json(new SuccessResponse(result, 'Stock committed successfully').toFormat());
  } catch (error) {
    next(error);
  }
};

const releaseReservation = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { reservationId } = req.params;
    const result = await reservationService.releaseReservation(reservationId, productId);
    return res.status(200).json(new SuccessResponse(result, 'Reservation released successfully').toFormat());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reserveStock,
  commitStock,
  releaseReservation
};
