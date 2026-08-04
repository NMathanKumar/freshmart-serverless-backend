const { randomUUID } = require('crypto');
const reservationRepo = require('../repositories/reservation.repository');
const { NotFoundError, BadRequestError } = require('@freshmart/service-shared').errors;

const reserveStock = async (productId, warehouseId, quantity, orderId) => {
  if (quantity <= 0) {
    throw new BadRequestError('Quantity must be greater than zero');
  }
  const reservationId = randomUUID();
  await reservationRepo.reserveStockTransaction(productId, reservationId, quantity, warehouseId, orderId);
  return {
    reservationId,
    productId,
    quantity,
    status: 'ACTIVE'
  };
};

const commitStock = async (reservationId, productId) => {
  await reservationRepo.commitReservation(productId, reservationId);
  return {
    reservationId,
    productId,
    status: 'COMMITTED'
  };
};

const releaseReservation = async (reservationId, productId) => {
  const reservation = await reservationRepo.getReservation(productId, reservationId);
  if (!reservation) {
    throw new NotFoundError(`Reservation ${reservationId} not found for product ${productId}`);
  }
  
  await reservationRepo.releaseReservationTransaction(productId, reservationId, reservation.quantity);
  
  return {
    reservationId,
    productId,
    status: 'RELEASED'
  };
};

module.exports = {
  reserveStock,
  commitStock,
  releaseReservation
};
