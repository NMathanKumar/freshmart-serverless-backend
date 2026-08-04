import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { createJwtAuthorizer, getAuthorizationHeader, type JwtAuthorizerOptions } from './auth.js';
import { createLogger, type LoggerContext } from './logger.js';
import { checkHealth } from './health.js';
import {
  handleRouteFailure,
  jsonResponse,
  parseJsonBody,
  problemResponse,
  resolveRoute,
  toLambdaResponse,
  type AuthContext,
  type RouteDefinition
} from './http.js';
import { DomainError } from './errors.js';

export interface ServiceRuntimeOptions {
  serviceName: string;
  routes: RouteDefinition[];
  authorizer?: JwtAuthorizerOptions;
}

const hasRequiredRoles = (auth: AuthContext, roles?: readonly string[]) => {
  if (!roles || roles.length === 0) {
    return true;
  }
  return roles.some((role) => auth.roles.includes(role));
};

const hasRequiredPermissions = (auth: AuthContext, permissions?: readonly string[]) => {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  if (auth.permissions.includes('*')) {
    return true; // SUPER_ADMIN wildcard
  }
  return permissions.every((perm) => auth.permissions.includes(perm));
};

export const createLambdaHandler = ({ serviceName, routes, authorizer }: ServiceRuntimeOptions) => {
  const authorize = createJwtAuthorizer(authorizer);

  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const startTime = performance.now();
    const requestId = event.requestContext.requestId;
    const correlationId = event.headers['x-correlation-id'] || requestId;
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    const operation = `[${method}] ${path}`;

    const responseHeaders = {
      'x-correlation-id': correlationId,
      'x-request-id': requestId
    };

    if (method === 'GET' && (path === '/health' || path === '/ready')) {
      return toLambdaResponse(
        jsonResponse(200, checkHealth()),
        responseHeaders
      );
    }

    let userId = '';
    let loggerContext: LoggerContext = {
      service: serviceName,
      requestId,
      correlationId,
      operation
    };
    let logger = createLogger(loggerContext);

    const resolved = resolveRoute(routes, method, path);
    if (!resolved) {
      const duration = performance.now() - startTime;
      const res = problemResponse(404, {
        type: 'about:blank',
        title: 'NotFound',
        status: 404,
        detail: 'Route not found.',
        instance: path,
        requestId
      });
      logger.error('Route not found', { duration, status: '404', errorCode: 'NOT_FOUND' });
      return toLambdaResponse(res, responseHeaders);
    }

    try {
      const authHeader = getAuthorizationHeader(event.headers);
      let auth: AuthContext = { roles: [], permissions: [] };

      if (resolved.route.authorize) {
        auth = await authorize(authHeader);
      } else if (authHeader) {
        try {
          auth = await authorize(authHeader);
        } catch {
          auth = { roles: [], permissions: [] };
        }
      }

      userId = auth.subject || '';
      loggerContext = { ...loggerContext, userId };
      logger = createLogger(loggerContext);

      if (!hasRequiredRoles(auth, resolved.route.roles)) {
        throw new DomainError('Insufficient role permissions.', 403);
      }

      if (!hasRequiredPermissions(auth, resolved.route.permissions)) {
        throw new DomainError('Insufficient access permissions.', 403);
      }

      const response = await resolved.route.handler({
        event,
        body: parseJsonBody(event),
        query: event.queryStringParameters ?? {},
        params: resolved.params,
        auth
      });

      const duration = performance.now() - startTime;
      logger.info('Request processed successfully', {
        duration,
        status: String(response.statusCode)
      });
      return toLambdaResponse(response, responseHeaders);
    } catch (error) {
      const duration = performance.now() - startTime;
      const res = handleRouteFailure(
        {
          ...logger,
          warn: (msg, extra) => logger.warn(msg, { ...extra, duration }),
          error: (msg, extra) => logger.error(msg, { ...extra, duration })
        },
        error,
        { path, requestId }
      );
      return toLambdaResponse(res, responseHeaders);
    }
  };
};
