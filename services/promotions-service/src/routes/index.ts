import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createPromotionsController } from '../controllers/index.js';
import { DynamoPromotionsRepository } from '../repositories/index.js';
import { PromotionsService } from '../services/index.js';

const config = loadConfig('promotions-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createPromotionsController(new PromotionsService(new DynamoPromotionsRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/promotions', authorize: true, handler: () => controller.list() },
  { method: 'GET', path: '/api/v1/promotions/:promotionId', authorize: true, handler: ({ params }) => controller.getById(params.promotionId) },
  { method: 'POST', path: '/api/v1/promotions', authorize: true, roles: ['admin', 'operations'], handler: ({ body }) => controller.upsert(body) }
];

export const handler = createLambdaHandler({
  serviceName: 'promotions-service',
  routes,
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
