import { ApiClient } from '../http/create-api-client.js';
import type { CategorySummary } from '../contracts/domain.js';
export declare class CategoryClient {
    private readonly client;
    constructor(client: ApiClient);
    listCategories(): Promise<CategorySummary[]>;
}
