import { jsonResponse, validate } from '@freshmart/platform-core';
import { addWishlistItemSchema, removeWishlistItemSchema } from '../dtos/index.js';
import type { WishlistService } from '../services/index.js';

export const createWishlistController = (service: WishlistService) => ({
  list: async (customerId: string) => jsonResponse(200, await service.listByCustomer(customerId)),
  add: async (body: unknown) => jsonResponse(201, await service.add(validate(addWishlistItemSchema, body))),
  remove: async (body: unknown) => {
    const input = validate(removeWishlistItemSchema, body);
    await service.remove(input.customerId, input.wishlistItemId);
    return jsonResponse(204, null);
  }
});
