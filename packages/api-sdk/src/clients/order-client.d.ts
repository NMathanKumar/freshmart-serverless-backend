import { ApiClient } from '../http/create-api-client.js';
export declare class OrderClient {
    private readonly client;
    constructor(client: ApiClient);
    listOrders(): Promise<Record<string, unknown>>;
    getOrder(orderId: string): Promise<Record<string, unknown>>;
}
