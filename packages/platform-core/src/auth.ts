import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DomainError } from './errors.js';
import type { AuthContext } from './http.js';
import { DynamoRepository } from './dynamo.js';

// Simple LRU-ish cache
class PermissionCache {
  private cache = new Map<string, { permissions: string[]; expiresAt: number }>();
  private readonly MAX_SIZE = 1000;
  private readonly TTL_MS = 300 * 1000; // 300 seconds

  get(role: string): string[] | null {
    const entry = this.cache.get(role);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(role);
      return null;
    }
    return entry.permissions;
  }

  set(role: string, permissions: string[]) {
    if (this.cache.size >= this.MAX_SIZE) {
      // Evict oldest (Map iterates in insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(role, {
      permissions,
      expiresAt: Date.now() + this.TTL_MS
    });
  }
}

const permissionCache = new PermissionCache();

// Fallback to a hardcoded env or dynamic lookup if needed, but IAM_TABLE_NAME should be injected via TF.
const getIamTable = () => process.env.IAM_TABLE_NAME || 'freshmart-iam';

async function fetchPermissionsForRole(role: string): Promise<string[]> {
  const cached = permissionCache.get(role);
  if (cached) return cached;

  try {
    const repo = new DynamoRepository(getIamTable());
    const items = await repo.query(`ROLE#${role}`, 'PERMISSION#');
    // Extract the permission name from the sk. Example: PERMISSION#product.create
    const permissions = items.map((item) => item.sk.replace('PERMISSION#', ''));
    permissionCache.set(role, permissions);
    return permissions;
  } catch (error) {
    console.error(`Failed to fetch permissions for role ${role}:`, error);
    return [];
  }
}

async function resolvePermissions(roles: string[]): Promise<string[]> {
  const permissionsSet = new Set<string>();
  await Promise.all(
    roles.map(async (role) => {
      const perms = await fetchPermissionsForRole(role);
      for (const p of perms) permissionsSet.add(p);
    })
  );
  return Array.from(permissionsSet);
}

export interface JwtAuthorizerOptions {
  userPoolId: string;
  clientId: string;
  tokenUse: 'access' | 'id';
}

export const getAuthorizationHeader = (headers?: Record<string, string | undefined>): string | undefined => {
  if (!headers) return undefined;
  return headers['authorization'] ?? headers['Authorization'] ?? headers['AUTHORIZATION'];
};

export const createJwtAuthorizer = (options?: JwtAuthorizerOptions) => {
  if (!options?.userPoolId || !options.clientId) {
    return async (): Promise<AuthContext> => ({ roles: [], permissions: [] });
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

    const token = authorizationHeader.replace(/^Bearer\s+/i, '');
    let claims;
    try {
      claims = await verifier.verify(token);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid token';
      throw new DomainError(`Unauthorized: ${msg}`, 401);
    }
    
    const groups = Array.isArray(claims['cognito:groups']) ? claims['cognito:groups'] : [];
    const roles = groups.map((value) => String(value));
    
    // Resolve permissions using DynamoDB and cache
    const permissions = await resolvePermissions(roles);

    return {
      subject: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : undefined,
      roles,
      permissions,
      claims: claims as Record<string, unknown>
    };
  };
};
