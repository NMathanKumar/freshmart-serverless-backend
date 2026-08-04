import { ApiClient } from '../http/create-api-client.js';

export class CartClient {
  constructor(private readonly client: ApiClient) {}

  getCart(_customerId?: string) {
    return this.client.request<Record<string, unknown>>({
      method: 'GET',
      url: '/v1/cart'
    });
  }

  saveCart(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({
      method: 'POST',
      url: '/v1/cart',
      data: payload
    });
  }

  updateItem(productId: string, payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({
      method: 'PATCH',
      url: `/v1/cart/${productId}`,
      data: payload
    });
  }

  removeItem(productId: string) {
    return this.client.request<Record<string, unknown>>({
      method: 'DELETE',
      url: `/v1/cart/${productId}`
    });
  }
}
