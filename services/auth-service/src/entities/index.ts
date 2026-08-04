export interface AuthProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
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
  idToken?: string;
  tokenType: string;
  expiresIn: number;
}
