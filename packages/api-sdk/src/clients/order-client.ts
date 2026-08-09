import { ApiClient } from '../http/create-api-client.js';
import type { AxiosRequestConfig } from 'axios';

export class OrderClient {
  constructor(private readonly client: ApiClient) {}

  listOrders(config?: AxiosRequestConfig) {
    return this.client.request<Record<string, unknown>>({
      ...config,
      method: 'GET',
      url: '/v1/orders'
    });
  }

  getOrder(orderId: string) {
    return this.client.request<Record<string, unknown>>({
      method: 'GET',
      url: `/v1/orders/${orderId}`
    });
  }

  listFulfillments(params?: Record<string, unknown>) {
    return this.client.request<import('../contracts/domain.js').Fulfillment[]>({
      method: 'GET',
      url: '/v1/fulfillments',
      params
    });
  }

  getFulfillment(fulfillmentId: string) {
    return this.client.request<import('../contracts/domain.js').Fulfillment>({
      method: 'GET',
      url: `/v1/fulfillments/${fulfillmentId}`
    });
  }

  createFulfillment(data: Record<string, unknown>) {
    return this.client.request<import('../contracts/domain.js').Fulfillment>({
      method: 'POST',
      url: '/v1/fulfillments',
      data
    });
  }

  updateFulfillmentStatus(fulfillmentId: string, status: string) {
    return this.client.request<import('../contracts/domain.js').Fulfillment>({
      method: 'PATCH',
      url: `/v1/fulfillments/${fulfillmentId}/status`,
      data: { status }
    });
  }
}
