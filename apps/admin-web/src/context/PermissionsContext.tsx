import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { freshmartSdk } from '../lib/sdk';

interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isAuthenticated || !user?.role) {
        setPermissions([]);
        return;
      }
      setIsLoading(true);
      try {
        // If there are multiple roles in the user profile, we can fetch all.
        // For now, assuming user.role is a single string or we use a fallback.
        const roleNames = Array.isArray(user.role) ? user.role : [user.role];
        
        const permsSet = new Set<string>();
        for (const role of roleNames) {
          if (role === 'SUPER_ADMIN') {
            permsSet.add('*');
            continue;
          }
          const roleData = await freshmartSdk.iam.getRole(role);
          if (roleData && roleData.permissions) {
            roleData.permissions.forEach((p) => permsSet.add(p));
          }
        }
        setPermissions(Array.from(permsSet));
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (permission: string) => {
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error('usePermissions must be used within PermissionsProvider');
  return context;
};
