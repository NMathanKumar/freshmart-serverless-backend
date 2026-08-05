import type { ReactNode } from 'react';
import { AdminLayout, AdminSidebar, AdminTopbar } from './admin-components.js';
import { adminUsers, catalogNav, operationsNav, procurementNav, retailNav, unifiedNav } from '../model/mock-data.js';
import { fetchAdminProfile } from '../api/admin-api.js';
import { useApiResource } from '../hooks/use-api-resource.js';

type ShellVariant = 'unified' | 'retail' | 'operations' | 'procurement' | 'catalog';
type PrecisionVariant = 'reviews' | 'products' | 'categories' | 'inventory' | 'orders' | 'suppliers' | 'purchase-orders' | 'customers' | 'delivery';

type AdminShellProps = {
  searchPlaceholder: string;
  variant?: ShellVariant;
  user?: keyof typeof adminUsers;
  precision?: boolean;
  precisionVariant?: PrecisionVariant;
  onSearch?: (value: string) => void;
  children: ReactNode;
};

export const AdminShell = ({
  children,
  onSearch,
  precision = false,
  precisionVariant = 'reviews',
  searchPlaceholder,
  user = 'main',
  variant = 'unified'
}: AdminShellProps) => {
  const { data: profile } = useApiResource(fetchAdminProfile);
  const fallbackUser = adminUsers[user];
  const activeUser = {
    ...fallbackUser,
    name: profile?.name || profile?.email || fallbackUser.name,
    role: profile?.role || fallbackUser.role
  };
  const nav = variant === 'unified'
    ? unifiedNav
    : variant === 'operations'
      ? operationsNav
      : variant === 'procurement'
        ? procurementNav
        : variant === 'catalog'
          ? catalogNav
          : retailNav;
  const usesEnterpriseShell = precisionVariant === 'inventory' || precisionVariant === 'orders' || precisionVariant === 'suppliers' || precisionVariant === 'purchase-orders';
  const footerPrimaryLabel = variant === 'procurement' || usesEnterpriseShell ? 'New Report' : 'New Product';
  const brandSubtitle = variant === 'procurement' || usesEnterpriseShell ? 'Enterprise Portal' : 'Admin Portal';

  return (
    <AdminLayout
      precision={precision}
      precisionVariant={precisionVariant}
      sidebar={(
        <AdminSidebar
          brandSubtitle={brandSubtitle}
          brandTitle={usesEnterpriseShell ? 'FreshMart Admin' : undefined}
          footerPrimaryLabel={footerPrimaryLabel}
          footerUser={variant === 'catalog' ? activeUser : undefined}
          nav={nav}
          precision={precision}
          precisionVariant={precisionVariant}
        />
      )}
      topbar={(
        <AdminTopbar
          compactUser={variant === 'catalog'}
          hideUser={precisionVariant === 'categories'}
          onSearch={onSearch}
          placeholder={searchPlaceholder}
          precision={precision}
          precisionVariant={precisionVariant}
          user={activeUser}
        />
      )}
    >
      {children}
    </AdminLayout>
  );
};
