import {
  Activity,
  Archive,
  Box,
  ChartNoAxesColumnIncreasing,
  Grid2x2,
  LayoutDashboard,
  MessageSquareText,
  Shapes,
  ShieldCheck,
  ShoppingCart,
  SquareChartGantt,
  Store,
  Ticket,
  Truck,
  UserCog,
  Users
} from 'lucide-react';
import { ROUTES } from './routes.js';
import { PERMISSIONS } from '../constants/permissions.js';
import type { NavigationItem } from '@/shared/types/navigation.js';

export const unifiedAdminNav: NavigationItem[] = [
  { id: 'dashboard', title: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW, order: 1 },
  { id: 'orders', title: 'Orders', path: ROUTES.ORDERS, icon: ShoppingCart, permission: PERMISSIONS.ORDERS_VIEW, order: 2 },
  { id: 'inventory', title: 'Inventory', path: ROUTES.INVENTORY, icon: Box, permission: PERMISSIONS.INVENTORY_VIEW, order: 3 },
  { id: 'products', title: 'Products', path: ROUTES.PRODUCTS, icon: Store, permission: PERMISSIONS.PRODUCTS_VIEW, order: 4 },
  { id: 'categories', title: 'Categories', path: ROUTES.CATEGORIES, icon: Grid2x2, permission: PERMISSIONS.CATEGORIES_VIEW, order: 5 },
  { id: 'users', title: 'Users', path: ROUTES.CUSTOMERS, icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW, order: 6 },
  { id: 'analytics', title: 'Analytics', path: ROUTES.ANALYTICS, icon: ChartNoAxesColumnIncreasing, permission: PERMISSIONS.ANALYTICS_VIEW, order: 7 },
  { id: 'settings', title: 'Settings', path: ROUTES.SETTINGS, icon: UserCog, permission: PERMISSIONS.SETTINGS_VIEW, order: 8 },
];

export const retailNav: NavigationItem[] = unifiedAdminNav;
export const catalogNav: NavigationItem[] = unifiedAdminNav;
export const operationsNav: NavigationItem[] = unifiedAdminNav;
export const procurementNav: NavigationItem[] = unifiedAdminNav;
