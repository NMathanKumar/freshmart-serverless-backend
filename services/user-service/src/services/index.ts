import { randomUUID } from 'node:crypto';
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
}