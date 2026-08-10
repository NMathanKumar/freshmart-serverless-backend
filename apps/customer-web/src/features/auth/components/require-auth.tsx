import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { requireCustomer } from '@freshmart/shared';
import { authPaths } from '../../../app/auth-paths.js';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  if (!requireCustomer()) {
    return (
      <Navigate
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
        to={authPaths.login}
      />
    );
  }

  return <>{children}</>;
};
