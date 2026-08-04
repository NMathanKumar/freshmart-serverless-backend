import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();

const write = (relativePath, content) => {
  const absolutePath = resolve(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content.trimStart(), 'utf8');
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const platformCoreFiles = {
  'packages/platform-core/package.json': json({
    name: '@freshmart/platform-core',
    version: '1.0.0',
    private: true,
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc -b',
      typecheck: 'tsc -b --pretty false',
      test: 'node --test --import tsx test/platform-core.test.ts'
    },
    dependencies: {
      '@aws-sdk/client-dynamodb': '^3.842.0',
      '@aws-sdk/client-eventbridge': '^3.842.0',
      '@aws-sdk/client-s3': '^3.842.0',
      '@aws-sdk/client-sns': '^3.842.0',
      '@aws-sdk/client-sqs': '^3.842.0',
      '@aws-sdk/lib-dynamodb': '^3.842.0',
      'aws-jwt-verify': '^5.1.1',
      zod: '^3.25.76'
    }
  }),
  'packages/platform-core/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
`,
  'packages/platform-core/src/errors.ts': `export class DomainError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
`,
  'packages/platform-core/src/logger.ts': `export interface LoggerContext {
  service: string;
  requestId?: string;
  traceId?: string;
  [key: string]: unknown;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const emit = (level: string, context: LoggerContext, message: string, extra?: Record<string, unknown>) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    ...extra
  };
  console.log(JSON.stringify(payload));
};

export const createLogger = (context: LoggerContext): Logger => ({
  info(message, extra) {
    emit('INFO', context, message, extra);
  },
  warn(message, extra) {
    emit('WARN', context, message, extra);
  },
  error(message, extra) {
    emit('ERROR', context, message, extra);
  }
});
`,
  'packages/platform-core/src/http.ts': `import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DomainError } from './errors.js';
import type { Logger } from './logger.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AuthContext {
  subject?: string;
  email?: string;
  roles: string[];
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

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
  authorize?: boolean;
  roles?: readonly string[];
  handler: (request: HttpRequest) => Promise<HttpResponse> | HttpResponse;
}

const normalizePath = (path: string) => path.replace(/\\/+$/, '') || '/';

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

export const toLambdaResponse = (response: HttpResponse): APIGatewayProxyResultV2 => ({
  statusCode: response.statusCode,
  body: JSON.stringify(response.body),
  headers: response.headers
});

export const resolveRoute = (routes: RouteDefinition[], method: string, path: string) => {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }
    const params = matchPath(route.path, path);
    if (params) {
      return { route, params };
    }
  }
  return null;
};

export const handleRouteFailure = (logger: Logger, error: unknown): HttpResponse => {
  if (error instanceof DomainError) {
    logger.warn(error.message, { details: error.details, statusCode: error.statusCode });
    return jsonResponse(error.statusCode, {
      error: error.name,
      message: error.message,
      details: error.details ?? null
    });
  }

  logger.error('Unhandled exception', {
    error: error instanceof Error ? error.message : String(error)
  });
  return jsonResponse(500, {
    error: 'InternalServerError',
    message: 'An unexpected error occurred.'
  });
};
`,
  'packages/platform-core/src/validation.ts': `import { DomainError } from './errors.js';
import type { ZodTypeAny, output } from 'zod';

export const validate = <TSchema extends ZodTypeAny>(schema: TSchema, payload: unknown): output<TSchema> => {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new DomainError('Validation failed.', 422, parsed.error.flatten());
  }
  return parsed.data;
};
`,
  'packages/platform-core/src/auth.ts': `import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DomainError } from './errors.js';
import type { AuthContext } from './http.js';

export interface JwtAuthorizerOptions {
  userPoolId: string;
  clientId: string;
  tokenUse: 'access' | 'id';
}

export const createJwtAuthorizer = (options?: JwtAuthorizerOptions) => {
  if (!options?.userPoolId || !options.clientId) {
    return async (): Promise<AuthContext> => ({ roles: [] });
  }

  const verifier = CognitoJwtVerifier.create({
    userPoolId: options.userPoolId,
    tokenUse: options.tokenUse,
    clientId: options.clientId
  });

  return async (authorizationHeader?: string): Promise<AuthContext> => {
    if (!authorizationHeader) {
      throw new DomainError('Authorization header is required.', 401);
    }

    const token = authorizationHeader.replace(/^Bearer\\s+/i, '');
    const claims = await verifier.verify(token);
    const groups = Array.isArray(claims['cognito:groups']) ? claims['cognito:groups'] : [];
    return {
      subject: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : undefined,
      roles: groups.map((value) => String(value)),
      claims: claims as Record<string, unknown>
    };
  };
};
`,
  'packages/platform-core/src/dynamo.ts': `import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';

export interface TableEntity {
  pk: string;
  sk: string;
  [key: string]: unknown;
}

export const createDocumentClient = () =>
  DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION
    }),
    {
      marshallOptions: {
        removeUndefinedValues: true
      }
    }
  );

export class DynamoRepository<TItem extends TableEntity> {
  constructor(
    private readonly tableName: string,
    private readonly client = createDocumentClient()
  ) {}

  async put(item: TItem): Promise<TItem> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item
      })
    );
    return item;
  }

  async get(pk: string, sk: string): Promise<TItem | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk }
      })
    );
    return (result.Item as TItem | undefined) ?? null;
  }

  async query(pk: string, beginsWith?: string): Promise<TItem[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: beginsWith ? 'pk = :pk and begins_with(sk, :sk)' : 'pk = :pk',
        ExpressionAttributeValues: beginsWith
          ? {
              ':pk': pk,
              ':sk': beginsWith
            }
          : {
              ':pk': pk
            }
      })
    );
    return (result.Items as TItem[] | undefined) ?? [];
  }

  async update(
    key: Pick<TItem, 'pk' | 'sk'>,
    expression: string,
    values: Record<string, unknown>,
    names?: Record<string, string>
  ): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        UpdateExpression: expression,
        ExpressionAttributeValues: values,
        ExpressionAttributeNames: names
      })
    );
  }
}
`,
  'packages/platform-core/src/events.ts': `import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export interface DomainEvent<TDetail = unknown> {
  source: string;
  detailType: string;
  detail: TDetail;
}

export interface EventPublisher {
  publish<TDetail>(event: DomainEvent<TDetail>): Promise<void>;
}

export class EventBridgePublisher implements EventPublisher {
  constructor(
    private readonly busName: string,
    private readonly client = new EventBridgeClient({ region: process.env.AWS_REGION })
  ) {}

  async publish<TDetail>(event: DomainEvent<TDetail>): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: this.busName,
            Source: event.source,
            DetailType: event.detailType,
            Detail: JSON.stringify(event.detail)
          }
        ]
      })
    );
  }
}

export class SnsPublisher {
  constructor(
    private readonly topicArn: string,
    private readonly client = new SNSClient({ region: process.env.AWS_REGION })
  ) {}

  async publish<TDetail>(detail: TDetail, subject: string): Promise<void> {
    await this.client.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Subject: subject,
        Message: JSON.stringify(detail)
      })
    );
  }
}

export class SqsPublisher {
  constructor(
    private readonly queueUrl: string,
    private readonly client = new SQSClient({ region: process.env.AWS_REGION })
  ) {}

  async publish<TDetail>(detail: TDetail): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(detail)
      })
    );
  }
}
`,
  'packages/platform-core/src/cache.ts': `export interface CacheStore {
  get<TValue>(key: string): Promise<TValue | null>;
  set<TValue>(key: string, value: TValue, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export class NoopCacheStore implements CacheStore {
  async get<TValue>(): Promise<TValue | null> {
    return null;
  }

  async set<TValue>(): Promise<void> {}

  async delete(): Promise<void> {}
}
`,
  'packages/platform-core/src/service.ts': `import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { createJwtAuthorizer, type JwtAuthorizerOptions } from './auth.js';
import { createLogger } from './logger.js';
import {
  handleRouteFailure,
  parseJsonBody,
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

export const createLambdaHandler = ({ serviceName, routes, authorizer }: ServiceRuntimeOptions) => {
  const authorize = createJwtAuthorizer(authorizer);

  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const logger = createLogger({
      service: serviceName,
      requestId: event.requestContext.requestId,
      traceId: event.headers['x-amzn-trace-id']
    });

    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    const resolved = resolveRoute(routes, method, path);
    if (!resolved) {
      return toLambdaResponse({
        statusCode: 404,
        body: {
          message: 'Route not found.'
        }
      });
    }

    try {
      const auth = resolved.route.authorize
        ? await authorize(event.headers.authorization)
        : ({ roles: [] } satisfies AuthContext);

      if (!hasRequiredRoles(auth, resolved.route.roles)) {
        throw new DomainError('Insufficient permissions.', 403);
      }

      const response = await resolved.route.handler({
        event,
        body: parseJsonBody(event),
        query: event.queryStringParameters ?? {},
        params: resolved.params,
        auth
      });

      logger.info('Request processed successfully', {
        method,
        path,
        statusCode: response.statusCode
      });
      return toLambdaResponse(response);
    } catch (error) {
      return toLambdaResponse(handleRouteFailure(logger, error));
    }
  };
};
`,
  'packages/platform-core/src/testing.ts': `export const fixedNow = () => new Date('2026-01-01T00:00:00.000Z').toISOString();
`,
  'packages/platform-core/src/index.ts': `export * from './auth.js';
export * from './cache.js';
export * from './dynamo.js';
export * from './errors.js';
export * from './events.js';
export * from './http.js';
export * from './logger.js';
export * from './service.js';
export * from './testing.js';
export * from './validation.js';
`,
  'packages/platform-core/test/platform-core.test.ts': `import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { DomainError, validate } from '../src/index.js';

test('validate returns parsed values for valid payloads', () => {
  const schema = z.object({ id: z.string().uuid() });
  const value = validate(schema, { id: '11111111-1111-4111-8111-111111111111' });
  assert.equal(value.id, '11111111-1111-4111-8111-111111111111');
});

test('validate throws a domain error for invalid payloads', () => {
  const schema = z.object({ id: z.string().uuid() });
  assert.throws(() => validate(schema, { id: 'invalid' }), DomainError);
});
`
};

const serviceDefinitions = [
  {
    folder: 'auth-service',
    packageName: '@freshmart/auth-service',
    serviceName: 'auth-service',
    title: 'Authentication Service',
    tableName: 'freshmart-auth',
    entityName: 'AuthProfile',
    dtoName: 'RegisterUserDto',
    entityFields: `export interface AuthProfile {
  userId: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  cognitoUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  refreshToken: string;
  accessToken: string;
  expiresIn: number;
}`,
    dtoSchema: `import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(8).max(20).optional()
});

export const loginSchema = z.object({
  username: z.string().email(),
  password: z.string().min(12).max(128)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(16)
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;`,
    repositoryCode: `import { randomUUID } from 'node:crypto';
import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { AuthProfile } from '../entities/index.js';

type AuthRecord = TableEntity & AuthProfile;

export interface AuthRepository {
  saveProfile(profile: AuthProfile): Promise<AuthProfile>;
  getProfile(userId: string): Promise<AuthProfile | null>;
}

export class DynamoAuthRepository implements AuthRepository {
  private readonly repository: DynamoRepository<AuthRecord>;

  constructor(tableName = process.env.AUTH_TABLE_NAME ?? 'freshmart-auth') {
    this.repository = new DynamoRepository<AuthRecord>(tableName);
  }

  async saveProfile(profile: AuthProfile): Promise<AuthProfile> {
    const item: AuthRecord = {
      pk: \`USER#\${profile.userId}\`,
      sk: 'PROFILE',
      ...profile
    };
    await this.repository.put(item);
    return profile;
  }

  async getProfile(userId: string): Promise<AuthProfile | null> {
    const item = await this.repository.get(\`USER#\${userId}\`, 'PROFILE');
    return item
      ? {
          userId: String(item.userId),
          email: String(item.email),
          phoneNumber: item.phoneNumber ? String(item.phoneNumber) : undefined,
          roles: Array.isArray(item.roles) ? item.roles.map((value) => String(value)) : [],
          status: item.status as AuthProfile['status'],
          cognitoUsername: String(item.cognitoUsername),
          createdAt: String(item.createdAt),
          updatedAt: String(item.updatedAt)
        }
      : null;
  }
}

export class InMemoryAuthRepository implements AuthRepository {
  private readonly profiles = new Map<string, AuthProfile>();

  async saveProfile(profile: AuthProfile): Promise<AuthProfile> {
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  async getProfile(userId: string): Promise<AuthProfile | null> {
    return this.profiles.get(userId) ?? null;
  }
}

export const createAuthProfile = (email: string, phoneNumber?: string): AuthProfile => {
  const timestamp = new Date().toISOString();
  return {
    userId: randomUUID(),
    email,
    phoneNumber,
    roles: ['customer'],
    status: 'ACTIVE',
    cognitoUsername: email,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};`,
    serviceCode: `import { randomUUID } from 'node:crypto';
import type { EventPublisher } from '@freshmart/platform-core';
import { DomainError } from '@freshmart/platform-core';
import type { AuthProfile, AuthSession } from '../entities/index.js';
import type { AuthRepository } from '../repositories/index.js';
import { createAuthProfile } from '../repositories/index.js';

export interface AuthServiceDependencies {
  repository: AuthRepository;
  publisher?: EventPublisher;
}

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  async register(input: { email: string; phoneNumber?: string }): Promise<AuthProfile> {
    const profile = createAuthProfile(input.email, input.phoneNumber);
    await this.dependencies.repository.saveProfile(profile);
    await this.dependencies.publisher?.publish({
      source: 'freshmart.auth',
      detailType: 'freshmart.auth.user_registered',
      detail: profile
    });
    return profile;
  }

  async login(input: { username: string; password: string }): Promise<AuthSession> {
    if (!input.password || input.password.length < 12) {
      throw new DomainError('Invalid credentials.', 401);
    }

    return {
      accessToken: \`access-\${randomUUID()}\`,
      refreshToken: \`refresh-\${randomUUID()}\`,
      expiresIn: 3600
    };
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    if (!refreshToken.startsWith('refresh-')) {
      throw new DomainError('Refresh token is invalid.', 401);
    }

    return {
      accessToken: \`access-\${randomUUID()}\`,
      refreshToken,
      expiresIn: 3600
    };
  }

  async getProfile(userId: string): Promise<AuthProfile> {
    const profile = await this.dependencies.repository.getProfile(userId);
    if (!profile) {
      throw new DomainError('Profile not found.', 404);
    }
    return profile;
  }
}`,
    controllerCode: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { loginSchema, refreshTokenSchema, registerUserSchema } from '../dtos/index.js';
import type { AuthService } from '../services/index.js';

export const createAuthController = (service: AuthService) => ({
  register: async (body: unknown) => {
    const input = validate(registerUserSchema, body);
    const profile = await service.register({
      email: input.email,
      phoneNumber: input.phoneNumber
    });
    return jsonResponse(201, profile);
  },
  login: async (body: unknown) => {
    const input = validate(loginSchema, body);
    const session = await service.login(input);
    return jsonResponse(200, session);
  },
  refresh: async (body: unknown) => {
    const input = validate(refreshTokenSchema, body);
    const session = await service.refresh(input.refreshToken);
    return jsonResponse(200, session);
  },
  me: async (userId: string) => jsonResponse(200, await service.getProfile(userId))
});`,
    routesCode: `import { EventBridgePublisher, createLambdaHandler, type RouteDefinition } from '@freshmart/platform-core';
import { createAuthController } from '../controllers/index.js';
import { DynamoAuthRepository } from '../repositories/index.js';
import { AuthService } from '../services/index.js';

const controller = createAuthController(
  new AuthService({
    repository: new DynamoAuthRepository(),
    publisher: process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined
  })
);

export const routes: RouteDefinition[] = [
  {
    method: 'POST',
    path: '/v1/auth/register',
    handler: ({ body }) => controller.register(body)
  },
  {
    method: 'POST',
    path: '/v1/auth/login',
    handler: ({ body }) => controller.login(body)
  },
  {
    method: 'POST',
    path: '/v1/auth/refresh-token',
    handler: ({ body }) => controller.refresh(body)
  },
  {
    method: 'GET',
    path: '/v1/auth/me',
    authorize: true,
    handler: ({ auth }) => controller.me(auth.subject ?? '')
  }
];

export const handler = createLambdaHandler({
  serviceName: 'auth-service',
  routes: [...routes],
  authorizer: {
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_APP_CLIENT_ID ?? '',
    tokenUse: 'access'
  }
});`,
    middlewareCode: `export const middlewareDescription = {
  authentication: 'AWS Cognito JWT validation',
  authorization: 'Role-based access for customer and admin actors',
  validation: 'Zod request schema validation'
};`,
    testCode: `import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../src/services/index.js';
import { InMemoryAuthRepository } from '../src/repositories/index.js';

test('auth service registers a profile with an active status', async () => {
  const service = new AuthService({
    repository: new InMemoryAuthRepository()
  });

  const profile = await service.register({
    email: 'principal@freshmart.com'
  });

  assert.equal(profile.status, 'ACTIVE');
  assert.equal(profile.roles.includes('customer'), true);
});`
  },
  {
    folder: 'user-service',
    packageName: '@freshmart/user-service',
    serviceName: 'user-service',
    title: 'User Service',
    tableName: 'freshmart-user',
    entityName: 'UserProfile',
    dtoName: 'UpsertProfileDto',
    entityFields: `export interface Address {
  addressId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  wishlistCount: number;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}`,
    dtoSchema: `import { z } from 'zod';

export const addressSchema = z.object({
  addressId: z.string().uuid().optional(),
  label: z.string().min(1).max(40),
  line1: z.string().min(1).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  postalCode: z.string().min(4).max(12),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const upsertProfileSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phoneNumber: z.string().min(8).max(20).optional()
});

export const addAddressSchema = addressSchema;

export type UpsertProfileDto = z.infer<typeof upsertProfileSchema>;
export type AddAddressDto = z.infer<typeof addAddressSchema>;`,
    repositoryCode: `import { randomUUID } from 'node:crypto';
import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Address, UserProfile } from '../entities/index.js';

type UserRecord = TableEntity & UserProfile;

export interface UserRepository {
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  getProfile(userId: string): Promise<UserProfile | null>;
}

export class DynamoUserRepository implements UserRepository {
  private readonly repository: DynamoRepository<UserRecord>;

  constructor(tableName = process.env.USER_TABLE_NAME ?? 'freshmart-user') {
    this.repository = new DynamoRepository<UserRecord>(tableName);
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    await this.repository.put({
      pk: \`USER#\${profile.userId}\`,
      sk: 'PROFILE',
      ...profile
    });
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const item = await this.repository.get(\`USER#\${userId}\`, 'PROFILE');
    return item ? (item as UserProfile) : null;
  }
}

export class InMemoryUserRepository implements UserRepository {
  private readonly profiles = new Map<string, UserProfile>();

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) ?? null;
  }
}

export const createAddress = (input: Omit<Address, 'addressId'> & Partial<Pick<Address, 'addressId'>>): Address => ({
  addressId: input.addressId ?? randomUUID(),
  ...input
});`,
    serviceCode: `import { randomUUID } from 'node:crypto';
import { DomainError } from '@freshmart/platform-core';
import type { Address, UserProfile } from '../entities/index.js';
import type { UserRepository } from '../repositories/index.js';
import { createAddress } from '../repositories/index.js';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async upsertProfile(userId: string, input: Omit<UserProfile, 'userId' | 'wishlistCount' | 'addresses' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const existing = await this.repository.getProfile(userId);
    const now = new Date().toISOString();
    const profile: UserProfile = {
      userId,
      wishlistCount: existing?.wishlistCount ?? 0,
      addresses: existing?.addresses ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...input
    };
    return this.repository.saveProfile(profile);
  }

  async addAddress(userId: string, input: Omit<Address, 'addressId'> & Partial<Pick<Address, 'addressId'>>): Promise<UserProfile> {
    const profile = await this.repository.getProfile(userId);
    if (!profile) {
      throw new DomainError('User profile not found.', 404);
    }
    profile.addresses.push(createAddress(input));
    profile.updatedAt = new Date().toISOString();
    return this.repository.saveProfile(profile);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.repository.getProfile(userId);
    if (!profile) {
      throw new DomainError('User profile not found.', 404);
    }
    return profile;
  }

  static newUserId(): string {
    return randomUUID();
  }
}`,
    controllerCode: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { addAddressSchema, upsertProfileSchema } from '../dtos/index.js';
import type { UserService } from '../services/index.js';

export const createUserController = (service: UserService) => ({
  upsertProfile: async (userId: string, body: unknown) => jsonResponse(200, await service.upsertProfile(userId, validate(upsertProfileSchema, body))),
  addAddress: async (userId: string, body: unknown) => jsonResponse(200, await service.addAddress(userId, validate(addAddressSchema, body))),
  getProfile: async (userId: string) => jsonResponse(200, await service.getProfile(userId))
});`,
    routesCode: `import { createLambdaHandler, type RouteDefinition } from '@freshmart/platform-core';
import { createUserController } from '../controllers/index.js';
import { DynamoUserRepository } from '../repositories/index.js';
import { UserService } from '../services/index.js';

const controller = createUserController(new UserService(new DynamoUserRepository()));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/v1/users/profile',
    authorize: true,
    handler: ({ auth }) => controller.getProfile(auth.subject ?? '')
  },
  {
    method: 'PUT',
    path: '/v1/users/profile',
    authorize: true,
    handler: ({ auth, body }) => controller.upsertProfile(auth.subject ?? '', body)
  },
  {
    method: 'POST',
    path: '/v1/users/addresses',
    authorize: true,
    handler: ({ auth, body }) => controller.addAddress(auth.subject ?? '', body)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'user-service',
  routes: [...routes],
  authorizer: {
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_APP_CLIENT_ID ?? '',
    tokenUse: 'access'
  }
});`,
    middlewareCode: `export const middlewareDescription = {
  authentication: 'JWT required for every customer profile endpoint',
  authorization: 'Customer or admin roles may inspect profile data',
  validation: 'All mutations are schema validated before persistence'
};`,
    testCode: `import assert from 'node:assert/strict';
import test from 'node:test';
import { UserService } from '../src/services/index.js';
import { InMemoryUserRepository } from '../src/repositories/index.js';

test('user service adds addresses to the profile aggregate', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);

  await service.upsertProfile('user-1', {
    firstName: 'Fresh',
    lastName: 'Mart',
    email: 'customer@freshmart.com'
  });

  const profile = await service.addAddress('user-1', {
    label: 'Home',
    line1: '42 Market Street',
    city: 'Bengaluru',
    state: 'KA',
    postalCode: '560001'
  });

  assert.equal(profile.addresses.length, 1);
});`
  }
];

const standardCrudDefinitions = [
  {
    folder: 'catalog-service',
    packageName: '@freshmart/catalog-service',
    serviceName: 'catalog-service',
    title: 'Catalog Service',
    tableName: 'freshmart-catalog',
    domain: 'products',
    singular: 'product',
    entityName: 'CatalogProduct',
    entityInterface: `export interface ProductVariant {
  variantId: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  attributes: Record<string, string>;
}

export interface CatalogProduct {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  variants: ProductVariant[];
  weightInGrams?: number;
  dimensions?: { length: number; width: number; height: number };
  rating: number;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER';
  discountPercentage?: number;
  inventoryReference: string;
  createdAt: string;
  updatedAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  brand: z.string().min(1).max(120),
  sku: z.string().min(3).max(80),
  categoryId: z.string().min(1).max(80),
  subcategoryId: z.string().min(1).max(80).optional(),
  description: z.string().min(10).max(4000),
  specifications: z.record(z.string(), z.string()),
  images: z.array(z.string().url()).min(1),
  variants: z.array(
    z.object({
      variantId: z.string().uuid().optional(),
      name: z.string().min(1).max(120),
      sku: z.string().min(3).max(80),
      price: z.number().nonnegative(),
      currency: z.string().length(3),
      attributes: z.record(z.string(), z.string())
    })
  ),
  weightInGrams: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive()
    })
    .optional(),
  rating: z.number().min(0).max(5).default(0),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER']),
  discountPercentage: z.number().min(0).max(100).optional(),
  inventoryReference: z.string().min(1).max(120)
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Catalog product not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const now = new Date().toISOString();
    const entity: CatalogProduct = {
      productId: input.productId ?? randomUUID(),
      ...input,
      rating: input.rating ?? 0,
      variants: input.variants.map((variant) => ({
        ...variant,
        variantId: variant.variantId ?? randomUUID()
      })),
      createdAt: now,
      updatedAt: now
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.catalog',
      detailType: 'freshmart.catalog.product_upserted',
      detail: entity
    });
    return entity;
  }`,
    lookupId: 'productId',
    endpointBase: '/v1/catalog/products',
    openapiTag: 'Catalog'
  },
  {
    folder: 'inventory-service',
    packageName: '@freshmart/inventory-service',
    serviceName: 'inventory-service',
    title: 'Inventory Service',
    tableName: 'freshmart-inventory',
    domain: 'inventory',
    singular: 'inventory item',
    entityName: 'InventorySnapshot',
    entityInterface: `export interface InventorySnapshot {
  sku: string;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  restockThreshold: number;
  warehouse: string;
  updatedAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  sku: z.string().min(3).max(80),
  availableStock: z.number().int().min(0),
  reservedStock: z.number().int().min(0),
  soldStock: z.number().int().min(0),
  restockThreshold: z.number().int().min(0),
  warehouse: z.string().min(2).max(120)
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Inventory snapshot not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const entity: InventorySnapshot = {
      ...input,
      updatedAt: new Date().toISOString()
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.inventory',
      detailType: 'freshmart.inventory.stock_updated',
      detail: entity
    });
    return entity;
  }`,
    lookupId: 'sku',
    endpointBase: '/v1/inventory/items',
    openapiTag: 'Inventory'
  },
  {
    folder: 'cart-service',
    packageName: '@freshmart/cart-service',
    serviceName: 'cart-service',
    title: 'Cart Service',
    tableName: 'freshmart-cart',
    domain: 'cart',
    singular: 'cart',
    entityName: 'Cart',
    entityInterface: `export interface CartLine {
  sku: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  customerId: string;
  items: CartLine[];
  couponCodes: string[];
  updatedAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  customerId: z.string().min(1).max(80),
  items: z.array(
    z.object({
      sku: z.string().min(1).max(80),
      productId: z.string().min(1).max(80),
      name: z.string().min(1).max(160),
      quantity: z.number().int().min(1),
      unitPrice: z.number().nonnegative()
    })
  ),
  couponCodes: z.array(z.string().min(1).max(32)).default([])
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Cart not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const entity: Cart = {
      ...input,
      couponCodes: input.couponCodes ?? [],
      updatedAt: new Date().toISOString()
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.cart',
      detailType: 'freshmart.cart.updated',
      detail: entity
    });
    return entity;
  }`,
    lookupId: 'customerId',
    endpointBase: '/v1/cart',
    openapiTag: 'Cart'
  },
  {
    folder: 'order-service',
    packageName: '@freshmart/order-service',
    serviceName: 'order-service',
    title: 'Order Service',
    tableName: 'freshmart-order',
    domain: 'orders',
    singular: 'order',
    entityName: 'Order',
    entityInterface: `export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'PACKED' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderLine {
  sku: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  status: OrderStatus;
  items: OrderLine[];
  currency: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  orderId: z.string().uuid().optional(),
  customerId: z.string().min(1).max(80),
  status: z.enum(['CREATED', 'CONFIRMED', 'PACKED', 'READY', 'COMPLETED', 'CANCELLED']).default('CREATED'),
  items: z.array(
    z.object({
      sku: z.string().min(1).max(80),
      productId: z.string().min(1).max(80),
      quantity: z.number().int().min(1),
      unitPrice: z.number().nonnegative()
    })
  ),
  currency: z.string().length(3),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative()
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Order not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const now = new Date().toISOString();
    const entity: Order = {
      orderId: input.orderId ?? randomUUID(),
      ...input,
      status: input.status ?? 'CREATED',
      createdAt: now,
      updatedAt: now
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.order',
      detailType: 'freshmart.order.updated',
      detail: entity
    });
    return entity;
  }`,
    lookupId: 'orderId',
    endpointBase: '/v1/orders',
    openapiTag: 'Orders'
  },
  {
    folder: 'category-service',
    packageName: '@freshmart/category-service',
    serviceName: 'category-service',
    title: 'Category Service',
    tableName: 'freshmart-category',
    domain: 'categories',
    singular: 'category',
    entityName: 'Category',
    entityInterface: `export interface Category {
  categoryId: string;
  parentCategoryId?: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  categoryId: z.string().uuid().optional(),
  parentCategoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Category not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const now = new Date().toISOString();
    const entity: Category = {
      categoryId: input.categoryId ?? randomUUID(),
      ...input,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    await this.repository.save(entity);
    return entity;
  }`,
    lookupId: 'categoryId',
    endpointBase: '/v1/categories',
    openapiTag: 'Categories'
  },
  {
    folder: 'cms-service',
    packageName: '@freshmart/cms-service',
    serviceName: 'cms-service',
    title: 'CMS Service',
    tableName: 'freshmart-cms',
    domain: 'pages',
    singular: 'page',
    entityName: 'CmsPage',
    entityInterface: `export interface CmsPage {
  pageId: string;
  slug: string;
  title: string;
  content: string;
  type: 'ABOUT_US' | 'PRIVACY_POLICY' | 'TERMS' | 'FAQ' | 'CONTACT' | 'ANNOUNCEMENT';
  isPublished: boolean;
  updatedAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  pageId: z.string().uuid().optional(),
  slug: z.string().min(2).max(120),
  title: z.string().min(2).max(120),
  content: z.string().min(10),
  type: z.enum(['ABOUT_US', 'PRIVACY_POLICY', 'TERMS', 'FAQ', 'CONTACT', 'ANNOUNCEMENT']),
  isPublished: z.boolean().default(false)
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('CMS page not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const entity: CmsPage = {
      pageId: input.pageId ?? randomUUID(),
      ...input,
      isPublished: input.isPublished ?? false,
      updatedAt: new Date().toISOString()
    };
    await this.repository.save(entity);
    return entity;
  }`,
    lookupId: 'pageId',
    endpointBase: '/v1/cms/pages',
    openapiTag: 'CMS'
  },
  {
    folder: 'analytics-service',
    packageName: '@freshmart/analytics-service',
    serviceName: 'analytics-service',
    title: 'Analytics Service',
    tableName: 'freshmart-analytics',
    domain: 'analytics',
    singular: 'analytics snapshot',
    entityName: 'AnalyticsSnapshot',
    entityInterface: `export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface AnalyticsSnapshot {
  snapshotId: string;
  dateKey: string;
  revenue: number;
  sales: number;
  customers: number;
  orders: number;
  peakHours: string[];
  topProducts: TopProduct[];
  createdAt: string;
}`,
    schema: `import { z } from 'zod';

export const upsertSchema = z.object({
  snapshotId: z.string().uuid().optional(),
  dateKey: z.string().min(8).max(10),
  revenue: z.number().nonnegative(),
  sales: z.number().nonnegative(),
  customers: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
  peakHours: z.array(z.string().min(1).max(20)),
  topProducts: z.array(
    z.object({
      productId: z.string().min(1).max(80),
      name: z.string().min(1).max(160),
      unitsSold: z.number().int().nonnegative(),
      revenue: z.number().nonnegative()
    })
  )
});

export type UpsertDto = z.infer<typeof upsertSchema>;`,
    businessMethods: `async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Analytics snapshot not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const entity: AnalyticsSnapshot = {
      snapshotId: input.snapshotId ?? randomUUID(),
      ...input,
      createdAt: new Date().toISOString()
    };
    await this.repository.save(entity);
    return entity;
  }`,
    lookupId: 'snapshotId',
    endpointBase: '/v1/analytics/snapshots',
    openapiTag: 'Analytics'
  }
];

const bffDefinitions = [
  {
    folder: 'customer-bff-service',
    packageName: '@freshmart/customer-bff-service',
    serviceName: 'customer-bff-service',
    title: 'Customer Backend For Frontend',
    readmeName: 'Customer BFF',
    entity: `export interface HomePageView {
  heroBanners: Array<{ id: string; title: string; imageUrl: string }>;
  categories: Array<{ categoryId: string; name: string }>;
  featuredProducts: Array<{ productId: string; name: string; price: number }>;
  trendingProducts: Array<{ productId: string; name: string; price: number }>;
  offers: Array<{ code: string; title: string; discountPercentage: number }>;
  recommendedProducts: Array<{ productId: string; name: string; price: number }>;
  recentlyViewed: Array<{ productId: string; name: string }>;
  cartSummary: { itemCount: number; grandTotal: number };
}
`,
    dto: `import { z } from 'zod';

export const checkoutQuerySchema = z.object({
  customerId: z.string().min(1).max(80)
});

export type CheckoutQueryDto = z.infer<typeof checkoutQuerySchema>;`,
    repository: `export interface AggregationCacheRepository {
  getView<TView>(cacheKey: string): Promise<TView | null>;
  saveView<TView>(cacheKey: string, value: TView): Promise<TView>;
}

export class InMemoryAggregationCacheRepository implements AggregationCacheRepository {
  private readonly store = new Map<string, unknown>();

  async getView<TView>(cacheKey: string): Promise<TView | null> {
    return (this.store.get(cacheKey) as TView | undefined) ?? null;
  }

  async saveView<TView>(cacheKey: string, value: TView): Promise<TView> {
    this.store.set(cacheKey, value);
    return value;
  }
}
`,
    service: `import type { AggregationCacheRepository } from '../repositories/index.js';
import type { HomePageView } from '../entities/index.js';

export interface DownstreamGateway {
  getHome(customerId: string): Promise<HomePageView>;
  getProfile(customerId: string): Promise<Record<string, unknown>>;
  getCheckout(customerId: string): Promise<Record<string, unknown>>;
}

export class CustomerBffService {
  constructor(
    private readonly downstream: DownstreamGateway,
    private readonly cache: AggregationCacheRepository
  ) {}

  async getHome(customerId: string): Promise<HomePageView> {
    const cacheKey = \`home:\${customerId}\`;
    const cached = await this.cache.getView<HomePageView>(cacheKey);
    if (cached) {
      return cached;
    }
    const view = await this.downstream.getHome(customerId);
    await this.cache.saveView(cacheKey, view);
    return view;
  }

  async getProfile(customerId: string): Promise<Record<string, unknown>> {
    return this.downstream.getProfile(customerId);
  }

  async getCheckout(customerId: string): Promise<Record<string, unknown>> {
    return this.downstream.getCheckout(customerId);
  }
}

export class StaticCustomerGateway implements DownstreamGateway {
  async getHome(customerId: string): Promise<HomePageView> {
    return {
      heroBanners: [{ id: 'hero-1', title: 'Groceries in 10 minutes', imageUrl: 'https://assets.freshmart.example/banner-1.png' }],
      categories: [{ categoryId: 'cat-fruits', name: 'Fruits' }],
      featuredProducts: [{ productId: 'prod-1', name: 'Organic Banana', price: 45 }],
      trendingProducts: [{ productId: 'prod-2', name: 'Whole Milk', price: 60 }],
      offers: [{ code: 'WELCOME10', title: 'Welcome Offer', discountPercentage: 10 }],
      recommendedProducts: [{ productId: 'prod-3', name: 'Greek Yogurt', price: 110 }],
      recentlyViewed: [{ productId: 'prod-4', name: 'Sourdough Bread' }],
      cartSummary: { itemCount: 3, grandTotal: 425 }
    };
  }

  async getProfile(customerId: string): Promise<Record<string, unknown>> {
    return {
      user: { customerId, firstName: 'Fresh', lastName: 'Mart' },
      recentOrders: [],
      wishlistSummary: { totalItems: 0 },
      addresses: []
    };
  }

  async getCheckout(customerId: string): Promise<Record<string, unknown>> {
    return {
      customerId,
      cart: { itemCount: 3, grandTotal: 425 },
      address: null,
      deliveryEstimate: '15-20 minutes',
      availablePaymentMethods: ['UPI', 'CARD', 'COD'],
      coupons: [{ code: 'WELCOME10', discountPercentage: 10 }]
    };
  }
}`,
    controller: `import { jsonResponse } from '@freshmart/platform-core';
import type { CustomerBffService } from '../services/index.js';

export const createCustomerBffController = (service: CustomerBffService) => ({
  home: async (customerId: string) => jsonResponse(200, await service.getHome(customerId)),
  profile: async (customerId: string) => jsonResponse(200, await service.getProfile(customerId)),
  checkout: async (customerId: string) => jsonResponse(200, await service.getCheckout(customerId))
});`,
    routes: `import { createLambdaHandler, type RouteDefinition } from '@freshmart/platform-core';
import { createCustomerBffController } from '../controllers/index.js';
import { InMemoryAggregationCacheRepository } from '../repositories/index.js';
import { CustomerBffService, StaticCustomerGateway } from '../services/index.js';

const controller = createCustomerBffController(
  new CustomerBffService(new StaticCustomerGateway(), new InMemoryAggregationCacheRepository())
);

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/v1/customer/home',
    authorize: true,
    handler: ({ auth }) => controller.home(auth.subject ?? 'guest')
  },
  {
    method: 'GET',
    path: '/v1/customer/profile',
    authorize: true,
    handler: ({ auth }) => controller.profile(auth.subject ?? 'guest')
  },
  {
    method: 'GET',
    path: '/v1/customer/checkout',
    authorize: true,
    handler: ({ auth }) => controller.checkout(auth.subject ?? 'guest')
  }
];

export const handler = createLambdaHandler({
  serviceName: 'customer-bff-service',
  routes: [...routes],
  authorizer: {
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_APP_CLIENT_ID ?? '',
    tokenUse: 'access'
  }
});`,
    middleware: `export const middlewareDescription = {
  authentication: 'JWT required for customer aggregation endpoints',
  caching: 'Read-model cache abstraction ready for Redis implementation',
  resilience: 'BFF may serve cached compositions when downstream APIs degrade'
};`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryAggregationCacheRepository } from '../src/repositories/index.js';
import { CustomerBffService, StaticCustomerGateway } from '../src/services/index.js';

test('customer bff caches the home page composition', async () => {
  const cache = new InMemoryAggregationCacheRepository();
  const service = new CustomerBffService(new StaticCustomerGateway(), cache);

  const first = await service.getHome('customer-1');
  const second = await service.getHome('customer-1');

  assert.deepEqual(first, second);
});`
  },
  {
    folder: 'admin-bff-service',
    packageName: '@freshmart/admin-bff-service',
    serviceName: 'admin-bff-service',
    title: 'Admin Backend For Frontend',
    readmeName: 'Admin BFF',
    entity: `export interface DashboardView {
  todaysRevenue: number;
  todaysOrders: number;
  pendingOrders: number;
  inventoryAlerts: number;
  bestSellingProducts: Array<{ productId: string; name: string; unitsSold: number }>;
  revenueAnalytics: Array<{ interval: string; revenue: number }>;
  lowStockAlerts: Array<{ sku: string; availableStock: number }>;
  recentActivity: Array<{ timestamp: string; description: string }>;
}
`,
    dto: `export type DashboardQueryDto = {
  date?: string;
};`,
    repository: `import type { DashboardView } from '../entities/index.js';

export interface DashboardCacheRepository {
  getDashboard(): Promise<DashboardView | null>;
  saveDashboard(view: DashboardView): Promise<DashboardView>;
}

export class InMemoryDashboardCacheRepository implements DashboardCacheRepository {
  private dashboard: DashboardView | null = null;

  async getDashboard(): Promise<DashboardView | null> {
    return this.dashboard;
  }

  async saveDashboard(view: DashboardView): Promise<DashboardView> {
    this.dashboard = view;
    return view;
  }
}
`,
    service: `import type { DashboardView } from '../entities/index.js';
import type { DashboardCacheRepository } from '../repositories/index.js';

export interface AdminGateway {
  getDashboard(): Promise<DashboardView>;
}

export class AdminBffService {
  constructor(
    private readonly gateway: AdminGateway,
    private readonly cache: DashboardCacheRepository
  ) {}

  async getDashboard(): Promise<DashboardView> {
    const cached = await this.cache.getDashboard();
    if (cached) {
      return cached;
    }
    const dashboard = await this.gateway.getDashboard();
    await this.cache.saveDashboard(dashboard);
    return dashboard;
  }
}

export class StaticAdminGateway implements AdminGateway {
  async getDashboard(): Promise<DashboardView> {
    return {
      todaysRevenue: 145000,
      todaysOrders: 682,
      pendingOrders: 47,
      inventoryAlerts: 18,
      bestSellingProducts: [{ productId: 'prod-1', name: 'Organic Banana', unitsSold: 221 }],
      revenueAnalytics: [{ interval: '10:00', revenue: 12000 }],
      lowStockAlerts: [{ sku: 'BANANA-1KG', availableStock: 9 }],
      recentActivity: [{ timestamp: new Date().toISOString(), description: 'Warehouse Bengaluru flagged a low stock alert.' }]
    };
  }
}`,
    controller: `import { jsonResponse } from '@freshmart/platform-core';
import type { AdminBffService } from '../services/index.js';

export const createAdminBffController = (service: AdminBffService) => ({
  dashboard: async () => jsonResponse(200, await service.getDashboard())
});`,
    routes: `import { createLambdaHandler, type RouteDefinition } from '@freshmart/platform-core';
import { createAdminBffController } from '../controllers/index.js';
import { InMemoryDashboardCacheRepository } from '../repositories/index.js';
import { AdminBffService, StaticAdminGateway } from '../services/index.js';

const controller = createAdminBffController(
  new AdminBffService(new StaticAdminGateway(), new InMemoryDashboardCacheRepository())
);

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/v1/admin/dashboard',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: () => controller.dashboard()
  }
];

export const handler = createLambdaHandler({
  serviceName: 'admin-bff-service',
  routes: [...routes],
  authorizer: {
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_APP_CLIENT_ID ?? '',
    tokenUse: 'access'
  }
});`,
    middleware: `export const middlewareDescription = {
  authentication: 'JWT required for every admin route',
  authorization: 'Admin and ops roles only',
  caching: 'Dashboard snapshot cache abstraction ready for Redis'
};`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryDashboardCacheRepository } from '../src/repositories/index.js';
import { AdminBffService, StaticAdminGateway } from '../src/services/index.js';

test('admin bff returns dashboard insight cards', async () => {
  const service = new AdminBffService(new StaticAdminGateway(), new InMemoryDashboardCacheRepository());
  const dashboard = await service.getDashboard();
  assert.equal(dashboard.pendingOrders >= 0, true);
});`
  }
];

const createWorkspacePackageJson = (name, _title) =>
  json({
    name,
    version: '1.0.0',
    private: true,
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc -b',
      typecheck: 'tsc -b --pretty false',
      test: 'node --test --import tsx test/service.test.ts'
    },
    dependencies: {
      '@freshmart/platform-core': 'file:../../packages/platform-core',
      zod: '^3.25.76'
    }
  });

const createWorkspaceTsconfig = () => `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "references": [{ "path": "../../packages/platform-core" }],
  "include": ["src/**/*.ts"]
}
`;

const createOpenApi = (title, tag, listPath, itemPath, idParameter) =>
  json({
    openapi: '3.0.3',
    info: {
      title,
      version: '1.0.0',
      description: `${title} REST API for FreshMart.`
    },
    paths: {
      [listPath]: {
        get: {
          tags: [tag],
          summary: `List ${tag.toLowerCase()}`,
          responses: {
            200: {
              description: 'Successful response'
            }
          }
        },
        post: {
          tags: [tag],
          summary: `Create or update ${tag.toLowerCase()}`,
          responses: {
            200: {
              description: 'Created or updated'
            }
          }
        }
      },
      [itemPath]: {
        get: {
          tags: [tag],
          summary: `Get ${tag.toLowerCase()} by identifier`,
          parameters: [
            {
              in: 'path',
              name: idParameter,
              schema: { type: 'string' },
              required: true
            }
          ],
          responses: {
            200: {
              description: 'Successful response'
            }
          }
        }
      }
    }
  });

const serviceClassName = (serviceName) =>
  serviceName
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

const createStandardServiceFiles = (definition) => {
  const entityName = definition.entityName;
  const title = definition.title;
  const singularTitle = definition.singular;
  const lookupId = definition.lookupId;
  const className = serviceClassName(definition.serviceName);

  return {
    [`services/${definition.folder}/package.json`]: createWorkspacePackageJson(definition.packageName, title),
    [`services/${definition.folder}/tsconfig.json`]: createWorkspaceTsconfig(),
    [`services/${definition.folder}/README.md`]: `# ${title}

FreshMart ${title.toLowerCase()} implemented in TypeScript with DDD-inspired layers, Lambda-ready routing, OpenAPI contracts, structured logging, and isolated DynamoDB ownership.
`,
    [`services/${definition.folder}/openapi/openapi.json`]: createOpenApi(
      title,
      definition.openapiTag,
      definition.endpointBase,
      `${definition.endpointBase}/:${lookupId}`,
      lookupId
    ),
    [`services/${definition.folder}/src/entities/index.ts`]: definition.entityInterface,
    [`services/${definition.folder}/src/dtos/index.ts`]: definition.schema,
    [`services/${definition.folder}/src/repositories/index.ts`]: `import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { ${entityName} } from '../entities/index.js';

type StoredRecord = TableEntity & ${entityName};

export interface Repository {
  list(): Promise<${entityName}[]>;
  getById(id: string): Promise<${entityName} | null>;
  save(entity: ${entityName}): Promise<${entityName}>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? '${definition.tableName}') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<${entityName}[]> {
    return this.repository.query('${definition.domain.toUpperCase()}');
  }

  async getById(id: string): Promise<${entityName} | null> {
    const item = await this.repository.get('${definition.domain.toUpperCase()}', \`${lookupId.toUpperCase()}#\${id}\`);
    return item ? (item as ${entityName}) : null;
  }

  async save(entity: ${entityName}): Promise<${entityName}> {
    await this.repository.put({
      pk: '${definition.domain.toUpperCase()}',
      sk: \`${lookupId.toUpperCase()}#\${entity.${lookupId}}\`,
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, ${entityName}>();

  async list(): Promise<${entityName}[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<${entityName} | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: ${entityName}): Promise<${entityName}> {
    this.store.set(entity.${lookupId}, entity);
    return entity;
  }
}
`,
    [`services/${definition.folder}/src/services/index.ts`]: `import { randomUUID } from 'node:crypto';
import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { UpsertDto } from '../dtos/index.js';
import type { ${entityName} } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class ${className} {
  constructor(
    private readonly repository: Repository,
    private readonly publisher?: EventPublisher
  ) {}

  ${definition.businessMethods}
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
`,
    [`services/${definition.folder}/src/controllers/index.ts`]: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { ${className} } from '../services/index.js';

export const createController = (service: ${className}) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (${lookupId}: string) => jsonResponse(200, await service.getById(${lookupId})),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
`,
    [`services/${definition.folder}/src/validators/index.ts`]: `export { upsertSchema } from '../dtos/index.js';
`,
    [`services/${definition.folder}/src/middlewares/index.ts`]: `export const middlewareDescription = {
  authentication: 'JWT validation for protected ${title.toLowerCase()} endpoints',
  authorization: 'Role-aware endpoint access controls',
  validation: 'Schema-level input validation for ${singularTitle} mutations'
};
`,
    [`services/${definition.folder}/src/routes/index.ts`]: `import { createLambdaHandler, type RouteDefinition } from '@freshmart/platform-core';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { ${className}, createEventPublisher } from '../services/index.js';

const controller = createController(new ${className}(new DynamoStoreRepository(), createEventPublisher()));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '${definition.endpointBase}',
    authorize: true,
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '${definition.endpointBase}/:${lookupId}',
    authorize: true,
    handler: ({ params }) => controller.getById(params.${lookupId})
  },
  {
    method: 'POST',
    path: '${definition.endpointBase}',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ body }) => controller.upsert(body)
  }
];

export const handler = createLambdaHandler({
  serviceName: '${definition.serviceName}',
  routes: [...routes],
  authorizer: {
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_APP_CLIENT_ID ?? '',
    tokenUse: 'access'
  }
});`,
    [`services/${definition.folder}/src/index.ts`]: `export { handler } from './routes/index.js';
`,
    [`services/${definition.folder}/test/service.test.ts`]: `import assert from 'node:assert/strict';
import test from 'node:test';
import { ${className} } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('${title.toLowerCase()} persists and reads ${singularTitle} records', async () => {
  const service = new ${className}(new InMemoryRepository());
  const created = await service.upsert(${definition.sampleInput});
  const loaded = await service.getById(created.${lookupId});
  assert.deepEqual(loaded, created);
});
`
  };
};

standardCrudDefinitions[0].sampleInput = `{
    name: 'Fresh Almond Milk',
    slug: 'fresh-almond-milk',
    brand: 'FreshMart Select',
    sku: 'ALMOND-MILK-1L',
    categoryId: 'beverages',
    description: 'Unsweetened almond milk with a clean ingredient list.',
    specifications: { volume: '1L', diet: 'vegan' },
    images: ['https://assets.freshmart.example/products/almond-milk.png'],
    variants: [{ name: '1 Litre', sku: 'ALMOND-MILK-1L', price: 199, currency: 'INR', attributes: { size: '1L' } }],
    rating: 4.5,
    availability: 'IN_STOCK',
    inventoryReference: 'ALMOND-MILK-1L'
  }`;
standardCrudDefinitions[1].sampleInput = `{
    sku: 'BANANA-1KG',
    availableStock: 120,
    reservedStock: 15,
    soldStock: 220,
    restockThreshold: 25,
    warehouse: 'blr-warehouse-1'
  }`;
standardCrudDefinitions[2].sampleInput = `{
    customerId: 'customer-1',
    items: [{ sku: 'BANANA-1KG', productId: 'prod-1', name: 'Organic Banana', quantity: 2, unitPrice: 45 }],
    couponCodes: ['WELCOME10']
  }`;
standardCrudDefinitions[3].sampleInput = `{
    customerId: 'customer-1',
    status: 'CREATED',
    items: [{ sku: 'BANANA-1KG', productId: 'prod-1', quantity: 2, unitPrice: 45 }],
    currency: 'INR',
    subtotal: 90,
    deliveryFee: 25,
    discountAmount: 10,
    totalAmount: 105
  }`;
standardCrudDefinitions[4].sampleInput = `{
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    sortOrder: 4,
    isActive: true
  }`;
standardCrudDefinitions[5].sampleInput = `{
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: 'FreshMart privacy policy for customer and merchant data.',
    type: 'PRIVACY_POLICY',
    isPublished: true
  }`;
standardCrudDefinitions[6].sampleInput = `{
    dateKey: '2026-07-15',
    revenue: 145000,
    sales: 1130,
    customers: 682,
    orders: 597,
    peakHours: ['08:00', '20:00'],
    topProducts: [{ productId: 'prod-1', name: 'Organic Banana', unitsSold: 221, revenue: 9945 }]
  }`;

const createFocusedServiceFiles = (definition) => ({
  [`services/${definition.folder}/package.json`]: createWorkspacePackageJson(definition.packageName, definition.title),
  [`services/${definition.folder}/tsconfig.json`]: createWorkspaceTsconfig(),
  [`services/${definition.folder}/README.md`]: `# ${definition.title}

FreshMart ${definition.title.toLowerCase()} implemented for AWS Lambda with TypeScript, layered components, unit tests, and generated OpenAPI.
`,
  [`services/${definition.folder}/openapi/openapi.json`]: json({
    openapi: '3.0.3',
    info: {
      title: definition.title,
      version: '1.0.0'
    }
  }),
  [`services/${definition.folder}/src/entities/index.ts`]: definition.entityFields,
  [`services/${definition.folder}/src/dtos/index.ts`]: definition.dtoSchema,
  [`services/${definition.folder}/src/repositories/index.ts`]: definition.repositoryCode,
  [`services/${definition.folder}/src/services/index.ts`]: definition.serviceCode,
  [`services/${definition.folder}/src/controllers/index.ts`]: definition.controllerCode,
  [`services/${definition.folder}/src/routes/index.ts`]: definition.routesCode,
  [`services/${definition.folder}/src/validators/index.ts`]: `export * from '../dtos/index.js';
`,
  [`services/${definition.folder}/src/middlewares/index.ts`]: definition.middlewareCode,
  [`services/${definition.folder}/src/index.ts`]: `export { handler } from './routes/index.js';
`,
  [`services/${definition.folder}/test/service.test.ts`]: definition.testCode
});

const createBffFiles = (definition) => ({
  [`services/${definition.folder}/package.json`]: createWorkspacePackageJson(definition.packageName, definition.title),
  [`services/${definition.folder}/tsconfig.json`]: createWorkspaceTsconfig(),
  [`services/${definition.folder}/README.md`]: `# ${definition.readmeName}

FreshMart ${definition.readmeName} service responsible for customer-facing or admin-facing response composition and aggregation.
`,
  [`services/${definition.folder}/openapi/openapi.json`]: json({
    openapi: '3.0.3',
    info: {
      title: definition.title,
      version: '1.0.0'
    }
  }),
  [`services/${definition.folder}/src/entities/index.ts`]: definition.entity,
  [`services/${definition.folder}/src/dtos/index.ts`]: definition.dto,
  [`services/${definition.folder}/src/repositories/index.ts`]: definition.repository,
  [`services/${definition.folder}/src/services/index.ts`]: definition.service,
  [`services/${definition.folder}/src/controllers/index.ts`]: definition.controller,
  [`services/${definition.folder}/src/routes/index.ts`]: definition.routes,
  [`services/${definition.folder}/src/validators/index.ts`]: `export * from '../dtos/index.js';
`,
  [`services/${definition.folder}/src/middlewares/index.ts`]: definition.middleware,
  [`services/${definition.folder}/src/index.ts`]: `export { handler } from './routes/index.js';
`,
  [`services/${definition.folder}/test/service.test.ts`]: definition.test
});

const terraformFiles = {
  'terraform/stacks/freshmart-platform/README.md': `# FreshMart Platform Terraform Stack

This stack provisions the production-grade FreshMart TypeScript service suite on AWS Serverless with:

- Dedicated Lambda functions per microservice
- One DynamoDB table per service
- Shared Cognito, S3, EventBridge, SNS, SQS, CloudWatch, IAM, and API Gateway resources
- Event-driven projections for analytics and admin dashboards
`,
  'terraform/stacks/freshmart-platform/variables.tf': `variable "project_name" {
  type        = string
  default     = "freshmart"
  description = "Project name prefix."
}

variable "environment" {
  type        = string
  description = "Deployment environment."
}

variable "aws_region" {
  type        = string
  description = "AWS region."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Additional stack tags."
}

variable "web_callback_urls" {
  type        = list(string)
  default     = []
  description = "Allowed Cognito callback URLs."
}

variable "web_logout_urls" {
  type        = list(string)
  default     = []
  description = "Allowed Cognito logout URLs."
}
`,
  'terraform/stacks/freshmart-platform/locals.tf': `locals {
  common_tags = merge(
    {
      project      = var.project_name
      environment  = var.environment
      managed_by   = "terraform"
      architecture = "serverless-microservices"
    },
    var.tags
  )

  service_names = [
    "auth-service",
    "user-service",
    "catalog-service",
    "inventory-service",
    "cart-service",
    "order-service",
    "category-service",
    "cms-service",
    "analytics-service",
    "customer-bff-service",
    "admin-bff-service"
  ]

  eventbridge_bus_name = "\${var.project_name}-\${var.environment}-events"
  api_name             = "\${var.project_name}-\${var.environment}-api"

  dynamodb_tables = {
    for service_name in local.service_names :
    service_name => {
      table_name               = "\${var.project_name}-\${var.environment}-\${service_name}"
      partition_key            = "pk"
      sort_key                 = "sk"
      ttl_enabled              = false
      ttl_attribute            = null
      point_in_time_recovery   = true
      deletion_protection      = true
      stream_enabled           = true
      stream_view_type         = "NEW_AND_OLD_IMAGES"
      tags                     = { service = service_name }
      global_secondary_indexes = []
    }
  }

  iam_roles = {
    for service_name in local.service_names :
    service_name => {
      service_name               = service_name
      dynamodb_table_permissions = [{
        table_arn = module.dynamodb[service_name].table_arn
        actions   = [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
      }]
      allow_sns_publish              = true
      sns_topic_arns                 = values(module.sns.topic_arns)
      allow_sqs_send_message         = true
      sqs_queue_arns                 = values(module.sqs.queue_arn)
      allow_s3_object_access         = true
      s3_object_arns                 = [module.s3.object_arn]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [module.eventbridge.bus_name]
      allow_eventbridge_read         = true
      allow_cognito_user_pool_access = service_name == "auth-service"
      cognito_user_pool_arns         = [module.cognito.user_pool_arn]
      eventbridge_rule_name_prefixes = ["\${var.project_name}-\${var.environment}"]
      tags                           = { service = service_name }
    }
  }

  lambda_functions = {
    for service_name in local.service_names :
    service_name => {
      service_name                   = service_name
      function_name                  = "\${var.project_name}-\${var.environment}-\${service_name}"
      description                    = "FreshMart \${service_name} Lambda."
      filename                       = "\${path.module}/../../../artifacts/\${service_name}.zip"
      runtime                        = "nodejs22.x"
      handler                        = "dist/index.handler"
      timeout                        = 30
      memory_size                    = contains(["customer-bff-service", "admin-bff-service", "analytics-service"], service_name) ? 1024 : 512
      architecture                   = "arm64"
      role_arn                       = module.iam[service_name].role_arn
      tracing_mode                   = "Active"
      publish                        = true
      dead_letter_config             = { target_arn = module.sqs.dlq_arn[service_name] }
      reserved_concurrent_executions = null
      ephemeral_storage              = null
      layers                         = []
      log_retention_in_days          = 30
      subnet_ids                     = []
      security_group_ids             = []
      log_group_kms_key_id           = "alias/aws/logs"
      permissions                    = []
      tags                           = { service = service_name }
      environment_variables = {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
        AWS_REGION                          = var.aws_region
        EVENT_BUS_NAME                      = module.eventbridge.bus_name
        COGNITO_USER_POOL_ID                = module.cognito.user_pool_id
        COGNITO_APP_CLIENT_ID               = module.cognito.user_pool_client_id
        TABLE_NAME                          = module.dynamodb[service_name].table_name
        AUTH_TABLE_NAME                     = module.dynamodb["auth-service"].table_name
        USER_TABLE_NAME                     = module.dynamodb["user-service"].table_name
      }
    }
  }

  api_gateway_lambdas = {
    for service_name, lambda_module in module.lambda :
    service_name => {
      function_name = lambda_module.function_name
      function_arn  = lambda_module.function_arn
      invoke_arn    = lambda_module.invoke_arn
    }
  }

  api_gateway_routes = {
    auth_register = { method = "POST", path = "/v1/auth/register", lambda_key = "auth-service", authorization_type = "NONE", authorization_scopes = [] }
    auth_login    = { method = "POST", path = "/v1/auth/login", lambda_key = "auth-service", authorization_type = "NONE", authorization_scopes = [] }
    auth_refresh  = { method = "POST", path = "/v1/auth/refresh-token", lambda_key = "auth-service", authorization_type = "NONE", authorization_scopes = [] }
    auth_me       = { method = "GET", path = "/v1/auth/me", lambda_key = "auth-service", authorization_type = "JWT", authorization_scopes = [] }
    user_profile  = { method = "GET", path = "/v1/users/profile", lambda_key = "user-service", authorization_type = "JWT", authorization_scopes = [] }
    catalog_list  = { method = "GET", path = "/v1/catalog/products", lambda_key = "catalog-service", authorization_type = "JWT", authorization_scopes = [] }
    inventory_get = { method = "GET", path = "/v1/inventory/items", lambda_key = "inventory-service", authorization_type = "JWT", authorization_scopes = [] }
    cart_get      = { method = "GET", path = "/v1/cart", lambda_key = "cart-service", authorization_type = "JWT", authorization_scopes = [] }
    order_list    = { method = "GET", path = "/v1/orders", lambda_key = "order-service", authorization_type = "JWT", authorization_scopes = [] }
    category_list = { method = "GET", path = "/v1/categories", lambda_key = "category-service", authorization_type = "JWT", authorization_scopes = [] }
    cms_list      = { method = "GET", path = "/v1/cms/pages", lambda_key = "cms-service", authorization_type = "JWT", authorization_scopes = [] }
    analytics_get = { method = "GET", path = "/v1/analytics/snapshots", lambda_key = "analytics-service", authorization_type = "JWT", authorization_scopes = [] }
    customer_home = { method = "GET", path = "/v1/customer/home", lambda_key = "customer-bff-service", authorization_type = "JWT", authorization_scopes = [] }
    admin_dash    = { method = "GET", path = "/v1/admin/dashboard", lambda_key = "admin-bff-service", authorization_type = "JWT", authorization_scopes = [] }
  }

  sns_topics = {
    notifications = {
      name         = "\${var.project_name}-\${var.environment}-notifications"
      display_name = "FreshMart Notifications"
    }
    ops = {
      name         = "\${var.project_name}-\${var.environment}-ops"
      display_name = "FreshMart Ops"
    }
  }

  sqs_queues = {
    for service_name in local.service_names :
    service_name => {
      name                       = "\${var.project_name}-\${var.environment}-\${service_name}"
      visibility_timeout_seconds = 60
      max_receive_count          = 5
      dlq_name                   = "\${var.project_name}-\${var.environment}-\${service_name}-dlq"
      sns_topic_keys             = service_name == "analytics-service" ? ["notifications"] : []
    }
  }

  eventbridge_lambda_targets = {
    analytics = {
      function_name = module.lambda["analytics-service"].function_name
      function_arn  = module.lambda["analytics-service"].function_arn
    }
    admin = {
      function_name = module.lambda["admin-bff-service"].function_name
      function_arn  = module.lambda["admin-bff-service"].function_arn
    }
  }

  eventbridge_rules = {
    analytics_projections = {
      description          = "Feed order, cart, and catalog changes into analytics."
      detail_type_prefixes = ["freshmart.order", "freshmart.cart", "freshmart.catalog"]
      sources              = ["freshmart.order", "freshmart.cart", "freshmart.catalog"]
      target_lambda_keys   = ["analytics"]
    }
    admin_dashboard = {
      description          = "Project key business events into admin read models."
      detail_type_prefixes = ["freshmart.order", "freshmart.inventory"]
      sources              = ["freshmart.order", "freshmart.inventory"]
      target_lambda_keys   = ["admin"]
    }
  }

  cloudwatch_lambda_functions = {
    for service_name, lambda_module in module.lambda :
    service_name => {
      function_name  = lambda_module.function_name
      log_group_name = lambda_module.log_group_name
    }
  }

  cloudwatch_dynamodb_tables = {
    for service_name, table_module in module.dynamodb :
    service_name => {
      table_name = table_module.table_name
    }
  }
}
`,
  'terraform/stacks/freshmart-platform/main.tf': `data "aws_caller_identity" "current" {}

module "cognito" {
  source = "../../modules/cognito"

  project_name               = var.project_name
  environment                = var.environment
  aws_region                 = var.aws_region
  domain_prefix              = "\${var.project_name}-\${var.environment}-auth"
  callback_urls              = var.web_callback_urls
  logout_urls                = var.web_logout_urls
  mfa_configuration          = "OPTIONAL"
  software_token_mfa_enabled = true
  tags                       = local.common_tags
}

module "s3" {
  source = "../../modules/s3"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  bucket_name        = "\${var.project_name}-\${var.environment}-assets-\${data.aws_caller_identity.current.account_id}"
  versioning_enabled = true
  tags               = local.common_tags
}

module "sns" {
  source = "../../modules/sns"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  topics       = local.sns_topics
  tags         = local.common_tags
}

module "sqs" {
  source = "../../modules/sqs"

  project_name   = var.project_name
  environment    = var.environment
  aws_region     = var.aws_region
  queues         = local.sqs_queues
  sns_topic_arns = module.sns.topic_arns
  tags           = local.common_tags
}

module "eventbridge" {
  source = "../../modules/eventbridge"

  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  bus_name        = local.eventbridge_bus_name
  rules           = local.eventbridge_rules
  lambda_targets  = local.eventbridge_lambda_targets
  archive_enabled = true
  archive_name    = "\${var.project_name}-\${var.environment}-event-archive"
  tags            = local.common_tags
}

module "dynamodb" {
  for_each = local.dynamodb_tables

  source = "../../modules/dynamodb"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region
  table_name               = each.value.table_name
  partition_key            = each.value.partition_key
  sort_key                 = each.value.sort_key
  ttl_enabled              = each.value.ttl_enabled
  ttl_attribute            = each.value.ttl_attribute
  point_in_time_recovery   = each.value.point_in_time_recovery
  deletion_protection      = each.value.deletion_protection
  stream_enabled           = each.value.stream_enabled
  stream_view_type         = each.value.stream_view_type
  tags                     = merge(local.common_tags, each.value.tags)
  global_secondary_indexes = each.value.global_secondary_indexes
}

module "iam" {
  for_each = local.iam_roles

  source = "../../modules/iam"

  project_name                   = var.project_name
  environment                    = var.environment
  aws_region                     = var.aws_region
  service_name                   = each.value.service_name
  dynamodb_table_permissions     = each.value.dynamodb_table_permissions
  allow_sns_publish              = each.value.allow_sns_publish
  sns_topic_arns                 = each.value.sns_topic_arns
  allow_sqs_send_message         = each.value.allow_sqs_send_message
  sqs_queue_arns                 = each.value.sqs_queue_arns
  allow_s3_object_access         = each.value.allow_s3_object_access
  s3_object_arns                 = each.value.s3_object_arns
  allow_eventbridge_put_events   = each.value.allow_eventbridge_put_events
  eventbridge_bus_names          = each.value.eventbridge_bus_names
  allow_eventbridge_read         = each.value.allow_eventbridge_read
  allow_cognito_user_pool_access = each.value.allow_cognito_user_pool_access
  cognito_user_pool_arns         = each.value.cognito_user_pool_arns
  eventbridge_rule_name_prefixes = each.value.eventbridge_rule_name_prefixes
  enable_vpc_access              = false
  tags                           = merge(local.common_tags, each.value.tags)
}

module "lambda" {
  for_each = local.lambda_functions

  source = "../../modules/lambda"

  project_name                   = var.project_name
  environment                    = var.environment
  aws_region                     = var.aws_region
  service_name                   = each.value.service_name
  function_name                  = each.value.function_name
  description                    = each.value.description
  filename                       = each.value.filename
  source_code_hash               = try(filebase64sha256(each.value.filename), null)
  runtime                        = each.value.runtime
  handler                        = each.value.handler
  timeout                        = each.value.timeout
  memory_size                    = each.value.memory_size
  architecture                   = each.value.architecture
  role_arn                       = each.value.role_arn
  tracing_mode                   = each.value.tracing_mode
  publish                        = each.value.publish
  environment_variables          = each.value.environment_variables
  dead_letter_config             = each.value.dead_letter_config
  reserved_concurrent_executions = each.value.reserved_concurrent_executions
  ephemeral_storage              = each.value.ephemeral_storage
  layers                         = each.value.layers
  log_retention_in_days          = each.value.log_retention_in_days
  subnet_ids                     = each.value.subnet_ids
  security_group_ids             = each.value.security_group_ids
  log_group_kms_key_id           = each.value.log_group_kms_key_id
  permissions                    = each.value.permissions
  tags                           = merge(local.common_tags, each.value.tags)
}

module "apigateway" {
  source = "../../modules/apigateway"

  project_name           = var.project_name
  environment            = var.environment
  aws_region             = var.aws_region
  api_name               = local.api_name
  description            = "FreshMart platform HTTP API."
  lambdas                = local.api_gateway_lambdas
  routes                 = local.api_gateway_routes
  cors_allow_origins     = ["*"]
  cors_allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  cors_allow_headers     = ["content-type", "authorization", "x-amz-date", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
  cors_allow_credentials = false
  throttling_burst_limit = 200
  throttling_rate_limit  = 100
  jwt_authorizer_enabled = true
  jwt_issuer             = "https://cognito-idp.\${var.aws_region}.amazonaws.com/\${module.cognito.user_pool_id}"
  jwt_audience           = [module.cognito.user_pool_client_id]
  tags                   = local.common_tags
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  lambda_functions      = local.cloudwatch_lambda_functions
  api_id                = module.apigateway.api_id
  api_stage_name        = "v1"
  dynamodb_tables       = local.cloudwatch_dynamodb_tables
  log_retention_in_days = 30
  alarm_actions         = [module.sns.topic_arns["ops"]]
  ok_actions            = [module.sns.topic_arns["ops"]]
  tags                  = local.common_tags
}
`,
  'terraform/stacks/freshmart-platform/outputs.tf': `output "api_endpoint" {
  value       = module.apigateway.api_endpoint
  description = "FreshMart platform API endpoint."
}

output "service_table_names" {
  value = {
    for name, table in module.dynamodb :
    name => table.table_name
  }
  description = "DynamoDB tables keyed by service."
}

output "lambda_function_names" {
  value = {
    for name, lambda_module in module.lambda :
    name => lambda_module.function_name
  }
  description = "Lambda function names keyed by service."
}

output "event_bus_name" {
  value       = module.eventbridge.bus_name
  description = "EventBridge bus used by the platform."
}

output "assets_bucket_name" {
  value       = module.s3.bucket_name
  description = "Shared S3 assets bucket name."
}
`
};

const rootDocs = {
  'README.md': `# FreshMart Quick Commerce Platform

FreshMart is a production-grade, cloud-native quick commerce backend designed around AWS Serverless, TypeScript, microservices, Clean Architecture, DDD, and isolated DynamoDB ownership.

## Service Suite

- Authentication Service
- User Service
- Catalog Service
- Inventory Service
- Cart Service
- Order Service
- Category Service
- CMS Service
- Analytics Service
- Customer BFF Service
- Admin BFF Service

## Core Platform Standards

- Node.js 22 LTS with TypeScript
- REST APIs with OpenAPI 3.0 contracts
- Cognito-backed JWT authentication
- Structured JSON logging
- Event-driven integration with SNS, SQS, and EventBridge
- Terraform-managed serverless infrastructure
- Redis-ready cache interfaces for future adoption

## Bootstrap

1. Run \`npm install\`
2. Run \`npm run scaffold:platform\`
3. Run \`npm run build\`
4. Run \`npm test\`
`,
  'docs/architecture-overview.md': `# FreshMart Architecture Overview

FreshMart is a serverless quick commerce platform composed of independently deployable TypeScript microservices. Each service owns its own DynamoDB table, publishes domain events through EventBridge, and exposes Lambda-backed REST APIs behind API Gateway.

## Service Boundaries

- Authentication Service: Cognito-backed onboarding, JWT trust, and application identity lifecycle.
- User Service: customer profile and address management.
- Catalog Service: product, variant, and content-rich merchandising data.
- Inventory Service: stock, reserve, sell-through, and replenishment thresholds.
- Cart Service: customer baskets and coupon attachments.
- Order Service: order orchestration and lifecycle transitions.
- Category Service: hierarchical category trees for merchandising navigation.
- CMS Service: legal pages, FAQs, contact content, and announcements.
- Analytics Service: KPI snapshots, top products, and revenue reporting.
- Customer BFF: customer app composition for home, profile, and checkout.
- Admin BFF: admin dashboard composition and operational visibility.

## Shared Platform Components

- \`packages/platform-core\`: runtime, validation, auth, logging, DynamoDB, eventing, and cache abstractions.
- \`terraform/stacks/freshmart-platform\`: infrastructure composition for the new service suite.
- Generated OpenAPI specs per service under \`services/*/openapi\`.

## Security and Operations

- JWT validation via Cognito JWK verification.
- Role-based access boundaries at route level.
- Structured logs emitted as JSON to CloudWatch.
- Lambda tracing can be enabled with AWS X-Ray through Terraform integration.
- Cache abstractions allow drop-in Redis integration later without changing domain services.
`
};

for (const [path, content] of Object.entries(platformCoreFiles)) {
  write(path, content);
}

for (const definition of serviceDefinitions) {
  const files = createFocusedServiceFiles(definition);
  for (const [path, content] of Object.entries(files)) {
    write(path, content);
  }
}

for (const definition of standardCrudDefinitions) {
  const files = createStandardServiceFiles(definition);
  for (const [path, content] of Object.entries(files)) {
    write(path, content);
  }
}

for (const definition of bffDefinitions) {
  const files = createBffFiles(definition);
  for (const [path, content] of Object.entries(files)) {
    write(path, content);
  }
}

for (const [path, content] of Object.entries(terraformFiles)) {
  write(path, content);
}

for (const [path, content] of Object.entries(rootDocs)) {
  write(path, content);
}

console.log('FreshMart platform scaffolding generated successfully.');
