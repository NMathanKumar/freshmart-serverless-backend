import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  saveSession as saveSharedSession,
  getSession as getSharedSession,
  clearSession as clearSharedSession,
  isAuthenticated as checkIsAuthenticated,
  type SharedAuthSession,
} from '@freshmart/shared';

export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  groups?: string[];
  profile?: string;
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
  const [session, setSession] = useState<SharedAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Sanitize URL if any legacy parameters exist
        const params = new URLSearchParams(window.location.search);
        if (params.has('access_token') || params.has('id_token')) {
          const accessToken = params.get('access_token');
          const idToken = params.get('id_token');
          const refreshToken = params.get('refresh_token');
          const role = params.get('role');
          const profile = params.get('profile');

          if (accessToken) {
            let userClaims: any = {};
            if (idToken) {
              try {
                userClaims = JSON.parse(atob(idToken.split('.')[1]));
              } catch (_) {}
            }
            const userEmail = userClaims.email || userClaims['cognito:username'] || '';
            const userName = userClaims.name || userClaims.given_name || userClaims.nickname || userClaims['cognito:username'] || userEmail || 'Administrator';
            const userGroups = Array.isArray(userClaims['cognito:groups']) ? userClaims['cognito:groups'] : [];
            const userRole = role || userClaims['custom:role'] || (userGroups.length > 0 ? userGroups[0] : 'ADMIN');
            const userProfile = profile || userClaims['custom:profile'] || (userGroups.map((g: string) => String(g).toLowerCase()).includes('admin') ? 'admin' : 'customer');

            saveSharedSession({
              accessToken,
              idToken: idToken || undefined,
              refreshToken: refreshToken || undefined,
              user: {
                userId: userClaims.sub || '',
                email: userEmail,
                name: userName,
                role: userRole,
                groups: userGroups,
                profile: userProfile,
              },
            });
          }
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else if (params.has('code')) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        const existing = getSharedSession();
        if (existing) {
          setSession(existing);
        } else {
          setSession(null);
        }
      } catch (err) {
        console.error('Session initialization failed:', err);
        setSession(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  const login = () => {
    const isSubpathAdmin = window.location.pathname.startsWith('/admin') || window.location.href.includes('/admin') || window.location.port === '5173';
    const redirectUri = isSubpathAdmin
      ? `${window.location.origin}/admin/auth/callback`
      : `${window.location.origin}/auth/callback`;
    import('@freshmart/shared').then(({ redirectToSSO }) => {
      redirectToSSO(redirectUri);
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
        userId: session.user.userId || '',
        email: session.user.email || '',
        name: session.user.name || session.user.fullName || '',
        role: session.user.role,
        groups: session.user.groups,
        profile: session.user.profile,
      }
    : null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4fcf0] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-[#e9f2e7]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-700">Validating Session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        idToken: session?.idToken || null,
        accessToken: session?.accessToken || null,
        isAuthenticated: !!session?.accessToken && checkIsAuthenticated(),
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
