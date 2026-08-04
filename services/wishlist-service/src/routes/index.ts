import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createWishlistController } from '../controllers/index.js';
import { DynamoWishlistRepository } from '../repositories/index.js';
import { WishlistService } from '../services/index.js';

const config = loadConfig('wishlist-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createWishlistController(new WishlistService(new DynamoWishlistRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/wishlist/:customerId',
    authorize: true,
    handler: ({ params }) => controller.list(params.customerId)
  },
  {
    method: 'POST',
    path: '/api/v1/wishlist/items',
    authorize: true,
    handler: ({ body }) => controller.add(body)
  },
  {
    method: 'DELETE',
    path: '/api/v1/wishlist/items',
    authorize: true,
    handler: ({ body }) => controller.remove(body)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'wishlist-service',
  routes,
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
