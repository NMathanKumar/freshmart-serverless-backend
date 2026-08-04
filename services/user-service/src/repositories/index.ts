import { randomUUID } from 'node:crypto';
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
      pk: `USER#${profile.userId}`,
      sk: 'PROFILE',
      ...profile
    });
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const item = await this.repository.get(`USER#${userId}`, 'PROFILE');
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
});