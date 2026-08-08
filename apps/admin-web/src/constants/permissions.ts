export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_MANAGE: 'products:manage',
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_MANAGE: 'categories:manage',
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  ORDERS_VIEW: 'orders:view',
  ORDERS_MANAGE: 'orders:manage',
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_MANAGE: 'customers:manage',
  SUPPLIERS_VIEW: 'suppliers:view',
  SUPPLIERS_MANAGE: 'suppliers:manage',
  REPORTS_VIEW: 'reports:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
  ANALYTICS_VIEW: 'analytics:view',
  ROLES_VIEW: 'roles:view',
  ROLES_MANAGE: 'roles:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
