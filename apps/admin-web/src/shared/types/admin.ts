import type { LucideIcon } from 'lucide-react';

/**
 * Represents a single navigation item in the admin sidebar.
 * Icon, label, and path are static UI configuration – not business data.
 */
export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  children?: Array<{ label: string; path: string }>;
};

/**
 * Represents a KPI metric card definition.
 * Only `title`, `icon`, and `tone` are static; `value` and `subtitle` come from the API.
 */
export type Metric = {
  title: string;
  value: string;
  subtitle: string;
  accent?: string;
  badge?: string;
  tone?: 'success' | 'danger' | 'neutral';
  icon: LucideIcon;
};

/**
 * Represents the authenticated admin user displayed in the topbar and sidebar footer.
 * The `avatar` field is a UI fallback; the live value is sourced from the auth profile API.
 */
export type TopbarUser = {
  name: string;
  role: string;
  avatar: string;
};
