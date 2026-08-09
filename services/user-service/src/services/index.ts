import { randomUUID } from 'node:crypto';
import { DomainError } from '@freshmart/platform-core';
import type { Address, UserProfile } from '../entities/index.js';
import type { UserRepository } from '../repositories/index.js';
import { createAddress } from '../repositories/index.js';

const createEmptyProfile = (userId: string, claims?: Record<string, unknown>): UserProfile => {
  const now = new Date().toISOString();
  return {
    userId,
    
    firstName: typeof claims?.given_name === 'string' ? claims.given_name : '',
    lastName: typeof claims?.family_name === 'string' ? claims.family_name : '',
    email: typeof claims?.email === 'string' ? claims.email : '',
    phone: typeof claims?.phone_number === 'string' ? claims.phone_number : (typeof claims?.phone === 'string' ? claims.phone : undefined),
    phoneNumber: typeof claims?.phone_number === 'string' ? claims.phone_number : (typeof claims?.phone === 'string' ? claims.phone : undefined),

    wishlistCount: 0,
    addresses: [],
    createdAt: now,
    updatedAt: now
  };
};

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
    const profile = (await this.repository.getProfile(userId)) ?? createEmptyProfile(userId);
    profile.addresses.push(createAddress(input));
    profile.updatedAt = new Date().toISOString();
    return this.repository.saveProfile(profile);
  }

  async deleteAddress(userId: string, addressId: string): Promise<UserProfile> {
    const profile = (await this.repository.getProfile(userId)) ?? createEmptyProfile(userId);
    profile.addresses = profile.addresses.filter((a) => a.addressId !== addressId && (a as { id?: string }).id !== addressId);
    profile.updatedAt = new Date().toISOString();
    return this.repository.saveProfile(profile);
  }

  async getProfile(userId: string, claims?: Record<string, unknown>): Promise<UserProfile> {
    const existing = await this.repository.getProfile(userId);
    if (existing) return existing;
    const profile = createEmptyProfile(userId, claims);
    await this.repository.saveProfile(profile);
    return profile;
  }

  static newUserId(): string {
    return randomUUID();
  }
}