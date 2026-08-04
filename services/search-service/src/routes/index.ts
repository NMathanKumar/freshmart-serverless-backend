import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createSearchController } from '../controllers/index.js';
import { DynamoSearchRepository } from '../repositories/index.js';
import { SearchService } from '../services/index.js';

const config = loadConfig('search-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createSearchController(new SearchService(new DynamoSearchRepository(config.TABLE_NAME)));
export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/search', authorize: true, handler: ({ query }) => controller.search(query) },
  { method: 'POST', path: '/api/v1/search/documents', authorize: true, roles: ['admin', 'catalog-manager'], handler: ({ body }) => controller.upsert(body) }
];
export const handler = createLambdaHandler({
  serviceName: 'search-service',
  routes,
  authorizer: { userPoolId: config.COGNITO_USER_POOL_ID, clientId: config.COGNITO_APP_CLIENT_ID, tokenUse: 'access' }
});
