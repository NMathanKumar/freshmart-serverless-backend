import { randomUUID } from 'node:crypto';
import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { AuthProfile } from '../entities/index.js';

type AuthRecord = TableEntity & AuthProfile;

export interface AuthRepository {
  saveProfile(profile: AuthProfile): Promise<AuthProfile>;
  getProfile(userId: string): Promise<AuthProfile | null>;
  getProfileByEmail(email: string): Promise<AuthProfile | null>;
}

export class DynamoAuthRepository implements AuthRepository {
  private readonly repository: DynamoRepository<AuthRecord>;

  constructor(tableName = process.env.AUTH_TABLE_NAME ?? 'freshmart-auth') {
    this.repository = new DynamoRepository<AuthRecord>(tableName);
  }

  async saveProfile(profile: AuthProfile): Promise<AuthProfile> {
    const item: AuthRecord = {
      pk: `USER#${profile.userId}`,
      sk: 'PROFILE',
      gsi1pk: `EMAIL#${profile.email.toLowerCase()}`,
      gsi1sk: 'PROFILE',
      ...profile
    };
    await this.repository.put(item);
    return profile;
  }

  async getProfile(userId: string): Promise<AuthProfile | null> {
    const item = await this.repository.get(`USER#${userId}`, 'PROFILE');
    return item
      ? {
          userId: String(item.userId),
          email: String(item.email),
          firstName: String(item.firstName),
          lastName: String(item.lastName),
          phoneNumber: item.phoneNumber ? String(item.phoneNumber) : undefined,
          roles: Array.isArray(item.roles) ? item.roles.map((value) => String(value)) : [],
          status: item.status as AuthProfile['status'],
          cognitoUsername: String(item.cognitoUsername),
          createdAt: String(item.createdAt),
          updatedAt: String(item.updatedAt)
        }
      : null;
  }

  async getProfileByEmail(email: string): Promise<AuthProfile | null> {
    const [item] = await this.repository.queryByIndex('gsi1', 'gsi1pk', `EMAIL#${email.toLowerCase()}`, 'gsi1sk', {
      beginsWith: 'PROFILE',
      limit: 1
    });

    return item
      ? {
          userId: String(item.userId),
          email: String(item.email),
          firstName: String(item.firstName),
          lastName: String(item.lastName),
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

  async getProfileByEmail(email: string): Promise<AuthProfile | null> {
    return [...this.profiles.values()].find((profile) => profile.email === email) ?? null;
  }
}

export const createAuthProfile = (
  input: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
    status?: AuthProfile['status'];
    cognitoUsername?: string;
  }
): AuthProfile => {
  const timestamp = new Date().toISOString();
  return {
    userId: input.userId ?? randomUUID(),
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phoneNumber: input.phoneNumber,
    roles: [input.role ?? 'customer'],
    status: input.status ?? 'ACTIVE',
    cognitoUsername: input.cognitoUsername ?? input.email,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};
