import { ApiClient } from '../http/create-api-client.js';
export declare class CartClient {
    private readonly client;
    constructor(client: ApiClient);
    getCart(_customerId?: string): Promise<Record<string, unknown>>;
    saveCart(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
    updateItem(productId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>>;
    removeItem(productId: string): Promise<Record<string, unknown>>;
}
