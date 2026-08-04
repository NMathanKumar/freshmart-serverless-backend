import { EventBridgePublisher, createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createAuthController } from '../controllers/index.js';
import { AwsCognitoIdentityProvider } from '../integrations/cognito.js';
import { DynamoAuthRepository } from '../repositories/index.js';
import { AuthService } from '../services/index.js';

const config = loadConfig('auth-service', {
  AUTH_TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1),
  EVENT_BUS_NAME: z.string().min(1).optional()
});

const controller = createAuthController(
  new AuthService({
    repository: new DynamoAuthRepository(config.AUTH_TABLE_NAME),
    identityProvider: new AwsCognitoIdentityProvider({
      userPoolId: config.COGNITO_USER_POOL_ID,
      clientId: config.COGNITO_APP_CLIENT_ID,
      region: config.AWS_REGION
    }),
    publisher: config.EVENT_BUS_NAME ? new EventBridgePublisher(config.EVENT_BUS_NAME) : undefined
  })
);

export const routes: RouteDefinition[] = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: ({ body }) => controller.register(body)
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: ({ body }) => controller.login(body)
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    handler: ({ body }) => controller.refresh(body)
  },
  {
    method: 'POST',
    path: '/auth/logout',
    authorize: true,
    handler: ({ body }) => controller.logout(body)
  },
  {
    method: 'GET',
    path: '/auth/me',
    authorize: true,
    handler: ({ auth }) => controller.me(auth.subject ?? '')
  }
];

export const handler = createLambdaHandler({
  serviceName: 'auth-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
