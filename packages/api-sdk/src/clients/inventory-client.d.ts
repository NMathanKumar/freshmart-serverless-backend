import type { ApiEnvelope, InventorySummary, InventoryUpdateRequest } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';
export declare class InventoryClient {
    private readonly client;
    constructor(client: ApiClient);
    listInventory(page?: number, limit?: number): Promise<ApiEnvelope<InventorySummary[]>>;
    updateInventory(productId: string, payload: InventoryUpdateRequest): Promise<ApiEnvelope<InventorySummary>>;
}
