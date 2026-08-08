import { ApiClient } from '../http/create-api-client.js';
import type { ApiEnvelope, ProductSummary } from '../contracts/domain.js';
import type { AxiosRequestConfig } from 'axios';

export class CatalogClient {
  constructor(private readonly client: ApiClient) {}

  listProducts(params: { category?: string; cursor?: string; limit?: number } = {}, config?: AxiosRequestConfig) {
    return this.client.request<ApiEnvelope<ProductSummary[]>>({
      ...config,
      method: 'GET',
      url: '/v1/products',
      params
    });
  }

  getProduct(productId: string) {
    return this.client.request<ApiEnvelope<ProductSummary>>({
      method: 'GET',
      url: `/v1/products/${productId}`
    });
  }

  searchProducts(query: string, limit = 24, cursor?: string) {
    return this.client.request<ApiEnvelope<ProductSummary[]>>({
      method: 'GET',
      url: '/v1/products/search',
      params: { cursor, limit, q: query }
    });
  }

  createProduct(payload: Omit<ProductSummary, 'createdAt' | 'productId' | 'updatedAt' | 'version'>) {
    return this.client.request<ApiEnvelope<ProductSummary>>({ method: 'POST', url: '/v1/products', data: payload });
  }

  updateProduct(productId: string, payload: Partial<Omit<ProductSummary, 'createdAt' | 'productId' | 'updatedAt' | 'version'>>) {
    return this.client.request<ApiEnvelope<ProductSummary>>({ method: 'PUT', url: `/v1/products/${productId}`, data: payload });
  }

  deleteProduct(productId: string) {
    return this.client.request<ApiEnvelope<null>>({ method: 'DELETE', url: `/v1/products/${productId}` });
  }

  uploadProductImage(fileName: string, contentType: string) {
    return this.client.request<ApiEnvelope<{ uploadUrl: string; imageUrl: string }>>({
      method: 'POST',
      url: '/v1/products/upload-url',
      data: { fileName, contentType }
    });
  }
}
