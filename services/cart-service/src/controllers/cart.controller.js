const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created } = require('@freshmart/service-shared').response;
const cartService = require('../services/cart.service');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.userId);
  success(res, { message: 'Cart fetched', data: cart });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.userId, req.body, req.eventContext);
  created(res, { message: 'Item added to cart', data: cart });
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity(
    req.user.userId,
    req.params.productId,
    req.body.quantity,
    req.eventContext
  );
  success(res, { message: 'Cart item quantity updated', data: cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.userId, req.params.productId, req.eventContext);
  success(res, { message: 'Item removed from cart', data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.userId, req.eventContext);
  success(res, { message: 'Cart cleared', data: cart });
});

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };
