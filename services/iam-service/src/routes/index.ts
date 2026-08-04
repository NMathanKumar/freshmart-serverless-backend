import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoIamRepository } from '../repositories/index.js';
import { IamService } from '../services/index.js';

const config = loadConfig('iam-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createController(new IamService(new DynamoIamRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/iam/roles',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: () => controller.listRoles()
  },
  {
    method: 'GET',
    path: '/api/v1/iam/permissions',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: () => controller.listPermissions()
  },
  {
    method: 'PUT',
    path: '/api/v1/iam/roles/:roleName/permissions',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ params, body }) => controller.updateRolePermissions(params.roleName, (body as Record<string, unknown>) ?? {})
  }
];

export const handler = createLambdaHandler({
  serviceName: 'iam-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
