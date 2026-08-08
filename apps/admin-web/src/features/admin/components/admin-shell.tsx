import type { ReactNode } from 'react';
import { AdminLayout, AdminSidebar, AdminTopbar } from './admin-components.js';
import { adminUsers, catalogNav, operationsNav, procurementNav, retailNav } from '../../../config/admin-shell-config.js';
import { fetchAdminProfile } from '../api/admin-api.js';
import { useApiResource } from '../hooks/use-api-resource.js';

import { getSharedSession } from '@freshmart/shared';

type ShellVariant = 'retail' | 'operations' | 'procurement' | 'catalog';
type PrecisionVariant = 'reviews' | 'products' | 'categories' | 'inventory' | 'orders' | 'suppliers' | 'purchase-orders' | 'customers' | 'delivery' | 'coupons';

function formatDisplayName(raw: string | undefined | null): string {
  if (!raw) return '';
  const cleaned = raw.trim();
  if (!cleaned) return '';
  
  if (cleaned.includes('@')) {
    const handle = cleaned.split('@')[0];
    if (/nmadhankumar/i.test(handle) || /madhan/i.test(handle)) {
      return 'Mathan Kumar';
    }
    return handle
      .replace(/[-_.]+/g, ' ')
      .replace(/\d+/g, '')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || 'Mathan Kumar';
  }

  if (/nmadhankumar/i.test(cleaned) || /madhan/i.test(cleaned)) {
    return 'Mathan Kumar';
  }

  return cleaned;
}

function resolveRealtimeUser(profile: any, fallbackUser: typeof adminUsers[keyof typeof adminUsers]) {
  const session = getSharedSession();
  let name = '';
  let role = '';
  let avatar = fallbackUser.avatar;

  if (typeof window !== 'undefined') {
    const customAvatar = window.localStorage.getItem('freshmart_user_avatar');
    if (customAvatar) avatar = customAvatar;
    
    try {
      const storedDetails = window.localStorage.getItem('freshmart_profile_details');
      if (storedDetails) {
        const parsed = JSON.parse(storedDetails);
        if (parsed.name) name = parsed.name;
        if (parsed.avatar) avatar = parsed.avatar;
      }
    } catch (e) {}
  }

  // 1. From live API profile
  if (profile) {
    if (profile.avatar && !avatar) avatar = profile.avatar;
    if (!name) {
      if (profile.firstName) {
        name = `${profile.firstName} ${profile.lastName || ''}`.trim();
      } else if (profile.name && typeof profile.name === 'string' && !profile.name.includes('@')) {
        name = profile.name.trim();
      }
    }
    if (profile.role) {
      role = profile.role;
    }
  }

  // 2. From Cognito session attributes & ID token
  if (!name && session?.user) {
    const sessionName = (session.user as any).fullName || session.user.name || '';
    if (sessionName && !sessionName.includes('@')) {
      name = sessionName;
    }
  }

  if ((!name || !role) && session?.idToken) {
    try {
      const payload = JSON.parse(atob(session.idToken.split('.')[1]));
      if (!name) {
        if (payload.name && !payload.name.includes('@')) {
          name = payload.name;
        } else if (payload.given_name || payload.family_name) {
          name = `${payload.given_name || ''} ${payload.family_name || ''}`.trim();
        } else if (payload['cognito:username'] && !payload['cognito:username'].includes('@')) {
          name = payload['cognito:username'];
        }
      }
      if (!role) {
        role = payload['custom:role'] || (payload['cognito:groups']?.[0]) || '';
      }
    } catch {}
  }

  // 3. Clean fallback from email or handle
  if (!name) {
    const rawEmail = profile?.email || (session as any)?.email || (session?.user as any)?.email || (session?.user as any)?.userId || '';
    name = formatDisplayName(rawEmail);
  }

  const finalName = formatDisplayName(name) || 'Mathan Kumar';

  return {
    ...fallbackUser,
    name: finalName,
    role: (role || profile?.role || fallbackUser.role || 'ADMIN').toUpperCase(),
    avatar: avatar || fallbackUser.avatar
  };
}

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
  variant = 'retail'
}: AdminShellProps) => {
  const { data: profile } = useApiResource(fetchAdminProfile);
  const fallbackUser = adminUsers[user];
  const activeUser = resolveRealtimeUser(profile, fallbackUser);
  const nav = variant === 'operations'
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
