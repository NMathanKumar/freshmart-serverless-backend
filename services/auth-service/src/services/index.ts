import type { EventPublisher } from '@freshmart/platform-core';
import { DomainError } from '@freshmart/platform-core';
import type { AuthProfile, AuthSession } from '../entities/index.js';
import type { CognitoIdentityProvider } from '../integrations/cognito.js';
import type { AuthRepository } from '../repositories/index.js';
import { createAuthProfile } from '../repositories/index.js';

export interface AuthServiceDependencies {
  repository: AuthRepository;
  identityProvider: CognitoIdentityProvider;
  publisher?: EventPublisher;
}

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<AuthProfile> {
    const existing = await this.dependencies.repository.getProfileByEmail(input.email);
    if (existing) {
      throw new DomainError('An account with this email already exists.', 409);
    }

    const identity = await this.dependencies.identityProvider.register({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      role: 'customers'
    });

    const profile = createAuthProfile({
      userId: identity.userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      role: 'customer',
      cognitoUsername: identity.username
    });

    await this.dependencies.repository.saveProfile(profile);
    await this.dependencies.publisher?.publish({
      source: 'freshmart.auth',
      detailType: 'freshmart.auth.user_registered',
      detail: profile
    });
    return profile;
  }

  async login(input: { username: string; password: string }): Promise<AuthSession> {
    return this.dependencies.identityProvider.login(input.username, input.password);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    return this.dependencies.identityProvider.refresh(refreshToken);
  }

  async logout(accessToken: string): Promise<void> {
    await this.dependencies.identityProvider.logout(accessToken);
  }

  async getProfile(userId: string): Promise<AuthProfile> {
    const profile = await this.dependencies.repository.getProfile(userId);
    if (!profile) {
      throw new DomainError('Profile not found.', 404);
    }
    return profile;
  }
}
