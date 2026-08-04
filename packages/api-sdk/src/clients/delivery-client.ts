import type { ApiClient } from '../http/create-api-client.js';
import type { Delivery } from '../contracts/domain.js';

export class DeliveryClient {
  constructor(private readonly client: ApiClient) {}

  async getDelivery(deliveryId: string) {
    const response = await this.client.request<{ data: Delivery }>({
      method: 'GET',
      url: `/delivery-service/api/v1/deliveries/${deliveryId}`
    });
    return response.data;
  }

  async listDeliveries(orderId?: string) {
    const url = orderId ? `/delivery-service/api/v1/deliveries/order/${orderId}` : '/delivery-service/api/v1/admin/deliveries';
    const response = await this.client.request<{ data: Delivery[] }>({
      method: 'GET',
      url
    });
    return response.data;
  }

  async assignPartner(deliveryId: string, partnerId: string) {
    const response = await this.client.request<{ data: Delivery }>({
      method: 'PUT',
      url: `/delivery-service/api/v1/admin/deliveries/${deliveryId}/assign`,
      data: { partnerId }
    });
    return response.data;
  }

  async updateStatus(deliveryId: string, status: string) {
    const response = await this.client.request<{ data: Delivery }>({
      method: 'PUT',
      url: `/delivery-service/api/v1/deliveries/${deliveryId}/status`,
      data: { status }
    });
    return response.data;
  }
}
