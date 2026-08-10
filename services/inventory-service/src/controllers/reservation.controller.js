const reservationService = require('../services/reservation.service');
const { response } = require('@freshmart/service-shared');

const reserveStock = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, orderId } = req.body;
    const result = await reservationService.reserveStock(productId, warehouseId, quantity, orderId);
    return response.success(res, { message: 'Stock reserved successfully', data: result });
  } catch (error) {
    next(error);
  }
};

const commitStock = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { reservationId } = req.params;
    const result = await reservationService.commitStock(reservationId, productId);
    return response.success(res, { message: 'Stock committed successfully', data: result });
  } catch (error) {
    next(error);
  }
};

const releaseReservation = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { reservationId } = req.params;
    const result = await reservationService.releaseReservation(reservationId, productId);
    return response.success(res, { message: 'Reservation released successfully', data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reserveStock,
  commitStock,
  releaseReservation
};
