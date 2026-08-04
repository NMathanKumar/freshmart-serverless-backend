import { ApiClient } from '../http/create-api-client.js';
import type { CategorySummary } from '../contracts/domain.js';

export class CategoryClient {
  constructor(private readonly client: ApiClient) {}

  listCategories() {
    return this.client.request<CategorySummary[]>({
      method: 'GET',
      url: '/api/v1/categories'
    });
  }
}
