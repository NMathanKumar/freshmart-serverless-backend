import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DomainError } from './errors.js';
import type { Logger } from './logger.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AuthContext {
  subject?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  claims?: Record<string, unknown>;
}

export interface HttpRequest<TBody = unknown, TQuery = Record<string, string | undefined>> {
  event: APIGatewayProxyEventV2;
  body: TBody;
  query: TQuery;
  params: Record<string, string>;
  auth: AuthContext;
}

export interface HttpResponse<TBody = unknown> {
  statusCode: number;
  body: TBody;
  headers?: Record<string, string>;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  requestId?: string;
  errors?: unknown;
}

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
  authorize?: boolean;
  roles?: readonly string[];
  permissions?: readonly string[];
  handler: (request: HttpRequest) => Promise<HttpResponse> | HttpResponse;
}

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

const matchPath = (template: string, actual: string): Record<string, string> | null => {
  const templateParts = normalizePath(template).split('/').filter(Boolean);
  const actualParts = normalizePath(actual).split('/').filter(Boolean);
  if (templateParts.length !== actualParts.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let index = 0; index < templateParts.length; index += 1) {
    const templatePart = templateParts[index];
    const actualPart = actualParts[index];
    if (templatePart.startsWith(':')) {
      params[templatePart.slice(1)] = decodeURIComponent(actualPart);
      continue;
    }
    if (templatePart !== actualPart) {
      return null;
    }
  }

  return params;
};

export const parseJsonBody = <TBody>(event: APIGatewayProxyEventV2): TBody => {
  if (!event.body) {
    return {} as TBody;
  }
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  return JSON.parse(raw) as TBody;
};

export const jsonResponse = <TBody>(statusCode: number, body: TBody): HttpResponse<TBody> => ({
  statusCode,
  body,
  headers: {
    'content-type': 'application/json'
  }
});

export const problemResponse = (statusCode: number, problem: ProblemDetails): HttpResponse<ProblemDetails> => ({
  statusCode,
  body: problem,
  headers: {
    'content-type': 'application/problem+json'
  }
});

export const toLambdaResponse = (
  response: HttpResponse,
  defaultHeaders: Record<string, string> = {}
): APIGatewayProxyResultV2 => ({
  statusCode: response.statusCode,
  body: JSON.stringify(response.body),
  headers: {
    ...defaultHeaders,
    ...response.headers
  }
});

export const resolveRoute = (routes: RouteDefinition[], method: string, path: string) => {
  const stripPrefixes = (p: string) =>
    p
      .replace(/^\/v1(?=\/)/, '')
      .replace(/^\/api\/v1(?=\/)/, '')
      .replace(/^\/api(?=\/)/, '');

  const normalizedActual = stripPrefixes(path);

  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }
    let params = matchPath(route.path, path);
    if (!params && normalizedActual !== path) {
      params = matchPath(route.path, normalizedActual);
    }
    if (!params) {
      const normalizedTemplate = stripPrefixes(route.path);
      params = matchPath(normalizedTemplate, normalizedActual);
    }
    if (params) {
      return { route, params };
    }
  }
  return null;
};

export const handleRouteFailure = (
  logger: Logger,
  error: unknown,
  context: { path: string; requestId?: string }
): HttpResponse => {
  if (error instanceof DomainError) {
    logger.warn(error.message, { details: error.details, statusCode: error.statusCode });
    return problemResponse(error.statusCode, {
      type: error.type,
      title: error.title,
      status: error.statusCode,
      detail: error.message,
      instance: context.path,
      requestId: context.requestId,
      errors: error.details ?? null
    });
  }

  logger.error('Unhandled exception', {
    error: error instanceof Error ? error.message : String(error)
  });
  return problemResponse(500, {
    type: 'about:blank',
    title: 'InternalServerError',
    status: 500,
    detail: 'An unexpected error occurred.',
    instance: context.path,
    requestId: context.requestId
  });
};
