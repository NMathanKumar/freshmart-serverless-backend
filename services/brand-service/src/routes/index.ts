import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createBrandController } from '../controllers/index.js';
import { DynamoBrandRepository } from '../repositories/index.js';
import { BrandService } from '../services/index.js';

const config = loadConfig('brand-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});
const controller = createBrandController(new BrandService(new DynamoBrandRepository(config.TABLE_NAME)));
export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/brands', authorize: true, handler: () => controller.list() },
  { method: 'GET', path: '/api/v1/brands/:brandId', authorize: true, handler: ({ params }) => controller.getById(params.brandId) },
  { method: 'POST', path: '/api/v1/brands', authorize: true, roles: ['admin', 'catalog-manager'], handler: ({ body }) => controller.upsert(body) }
];
export const handler = createLambdaHandler({
  serviceName: 'brand-service',
  routes,
  authorizer: { userPoolId: config.COGNITO_USER_POOL_ID, clientId: config.COGNITO_APP_CLIENT_ID, tokenUse: 'access' }
});
