import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { DomainError } from '@freshmart/platform-core';
import type { AuthSession } from '../entities/index.js';

export interface RegisterIdentityInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface CognitoIdentityProvider {
  register(input: RegisterIdentityInput): Promise<{ userId: string; username: string }>;
  login(username: string, password: string): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  logout(accessToken: string): Promise<void>;
}

const toSession = (authenticationResult: {
  AccessToken?: string;
  RefreshToken?: string;
  IdToken?: string;
  ExpiresIn?: number;
  TokenType?: string;
}): AuthSession => {
  if (!authenticationResult.AccessToken || !authenticationResult.ExpiresIn || !authenticationResult.TokenType) {
    throw new DomainError('Authentication response from Cognito is incomplete.', 502);
  }

  return {
    accessToken: authenticationResult.AccessToken,
    refreshToken: authenticationResult.RefreshToken ?? '',
    idToken: authenticationResult.IdToken,
    expiresIn: authenticationResult.ExpiresIn,
    tokenType: authenticationResult.TokenType
  };
};

export class AwsCognitoIdentityProvider implements CognitoIdentityProvider {
  private readonly client: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;

  constructor(options?: {
    userPoolId?: string;
    clientId?: string;
    region?: string;
    client?: CognitoIdentityProviderClient;
  }) {
    this.userPoolId = options?.userPoolId ?? process.env.COGNITO_USER_POOL_ID ?? '';
    this.clientId = options?.clientId ?? process.env.COGNITO_APP_CLIENT_ID ?? '';
    this.client =
      options?.client ??
      new CognitoIdentityProviderClient({
        region: options?.region ?? process.env.AWS_REGION
      });

    if (!this.userPoolId || !this.clientId) {
      throw new Error('Missing Cognito configuration for auth-service.');
    }
  }

  async register(input: RegisterIdentityInput): Promise<{ userId: string; username: string }> {
    await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: input.email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email', Value: input.email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'given_name', Value: input.firstName },
          { Name: 'family_name', Value: input.lastName },
          ...(input.phoneNumber ? [{ Name: 'phone_number', Value: input.phoneNumber }] : [])
        ]
      })
    );

    await this.client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: input.email,
        Password: input.password,
        Permanent: true
      })
    );

    await this.client.send(
      new AdminAddUserToGroupCommand({
        GroupName: input.role,
        UserPoolId: this.userPoolId,
        Username: input.email
      })
    );

    const user = await this.client.send(
      new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: input.email
      })
    );

    const sub = user.UserAttributes?.find((attribute) => attribute.Name === 'sub')?.Value;
    if (!sub) {
      throw new DomainError('Failed to resolve Cognito user identifier after registration.', 502);
    }

    return {
      userId: sub,
      username: input.email
    };
  }

  async login(username: string, password: string): Promise<AuthSession> {
    const response = await this.client.send(
      new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      })
    );

    if (response.ChallengeName) {
      const challenge = await this.client.send(
        new AdminRespondToAuthChallengeCommand({
          UserPoolId: this.userPoolId,
          ClientId: this.clientId,
          ChallengeName: response.ChallengeName,
          Session: response.Session,
          ChallengeResponses: {
            USERNAME: username,
            PASSWORD: password
          }
        })
      );
      return toSession(challenge.AuthenticationResult ?? {});
    }

    return toSession(response.AuthenticationResult ?? {});
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const response = await this.client.send(
      new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      })
    );

    return {
      ...toSession(response.AuthenticationResult ?? {}),
      refreshToken
    };
  }

  async logout(accessToken: string): Promise<void> {
    await this.client.send(
      new GlobalSignOutCommand({
        AccessToken: accessToken
      })
    );
  }
}
