const reservationService = require('../services/reservation.service');
const { created, success } = require('@freshmart/service-shared').response;

const reserveStock = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, orderId } = req.body;
    const result = await reservationService.reserveStock(productId, warehouseId, quantity, orderId);
    return created(res, { data: result, message: 'Stock reserved successfully' });
  } catch (error) {
    next(error);
  }
};

const commitStock = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { reservationId } = req.params;
    const result = await reservationService.commitStock(reservationId, productId);
    return success(res, { data: result, message: 'Stock committed successfully' });
  } catch (error) {
    next(error);
  }
};

const releaseReservation = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { reservationId } = req.params;
    const result = await reservationService.releaseReservation(reservationId, productId);
    return success(res, { data: result, message: 'Reservation released successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reserveStock,
  commitStock,
  releaseReservation
};
