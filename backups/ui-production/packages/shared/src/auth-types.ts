export type AppRole = 'customer' | 'admin' | 'catalog-manager' | 'operations';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  tokenType?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: AppRole[];
  tokens: AuthTokens;
}

export interface PersistedAuthState {
  session: AuthSession | null;
  status: 'idle' | 'authenticated' | 'refreshing' | 'signed-out';
}
