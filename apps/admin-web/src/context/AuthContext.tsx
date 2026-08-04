import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  saveSharedSession,
  getSharedSession,
  clearSharedSession,
  type SharedAuthSession,
} from '@freshmart/shared';
import { freshmartSdk } from '../lib/sdk';

export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  idToken: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SharedAuthSession | null>(() => getSharedSession());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getSharedSession();
    if (existing) {
      setSession(existing);
    }
  }, []);

  const login = () => {
    import('@freshmart/shared').then(({ redirectToSSO, getEnvironmentUrls }) => {
      redirectToSSO(window.location.origin + '/auth/callback');
    });
  };

  const logout = () => {
    clearSharedSession();
    setSession(null);
    import('@freshmart/shared').then(({ logoutFromSSO }) => {
      logoutFromSSO(window.location.origin);
    });
  };

  const userProfile: UserProfile | null = session?.user
    ? {
        userId: session.user.userId || 'admin-1',
        email: session.user.email || 'admin@freshmart.com',
        name: session.user.name || session.user.fullName || 'Alex Rivera',
        role: session.user.role || 'ADMIN',
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        idToken: session?.idToken || null,
        accessToken: session?.accessToken || null,
        isAuthenticated: !!session?.accessToken,
        isLoading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
