import { ApiClient } from '../http/create-api-client.js';
import type { ApiEnvelope, ProductSummary } from '../contracts/domain.js';
export declare class CatalogClient {
    private readonly client;
    constructor(client: ApiClient);
    listProducts(params?: {
        category?: string;
        cursor?: string;
        limit?: number;
    }): Promise<ApiEnvelope<ProductSummary[]>>;
    getProduct(productId: string): Promise<ApiEnvelope<ProductSummary>>;
    searchProducts(query: string, limit?: number, cursor?: string): Promise<ApiEnvelope<ProductSummary[]>>;
    createProduct(payload: Omit<ProductSummary, 'createdAt' | 'productId' | 'updatedAt' | 'version'>): Promise<ApiEnvelope<ProductSummary>>;
    updateProduct(productId: string, payload: Partial<Omit<ProductSummary, 'createdAt' | 'productId' | 'updatedAt' | 'version'>>): Promise<ApiEnvelope<ProductSummary>>;
    deleteProduct(productId: string): Promise<ApiEnvelope<null>>;
}
