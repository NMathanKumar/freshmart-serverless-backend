import React, { useEffect, useState } from 'react';
import { getEnvironmentUrls, isAdmin, isAuthenticated } from '../shared-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN')[];
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles, fallback }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/admin/';
        sessionStorage.setItem('oauth_return_url', returnUrl);
        const isAdmin = returnUrl.startsWith('/admin');
        window.location.replace(isAdmin ? '/admin/login' : '/login');
        return;
      }

      const userIsAdmin = isAdmin();

      if (allowedRoles) {
        if (allowedRoles.includes('ADMIN') || allowedRoles.includes('SUPER_ADMIN')) {
          if (!userIsAdmin) {
            // Customer trying to access Admin
            window.location.replace('/');
            return;
          }
        }

        if (allowedRoles.includes('CUSTOMER')) {
          if (userIsAdmin) {
            // Admin trying to access Customer
            window.location.replace('/admin/');
            return;
          }
        }
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return (fallback as any) || null;
  }

  return <>{children}</>;
};
