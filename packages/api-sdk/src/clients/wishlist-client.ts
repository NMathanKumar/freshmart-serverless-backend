import type { WishlistResponse } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';

export class WishlistClient {
  constructor(private readonly client: ApiClient) {}

  getWishlist(customerId: string) {
    return this.client.request<WishlistResponse>({
      method: 'GET',
      url: `/api/v1/wishlist/${customerId}`
    });
  }

  addItem(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({
      method: 'POST',
      url: '/api/v1/wishlist/items',
      data: payload
    });
  }

  removeItem(payload: Record<string, unknown>) {
    return this.client.request<void>({
      method: 'DELETE',
      url: '/api/v1/wishlist/items',
      data: payload
    });
  }
}
