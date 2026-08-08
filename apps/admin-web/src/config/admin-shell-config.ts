/**
 * admin-shell-config.ts
 *
 * Static UI configuration for the Admin Shell.
 * Navigation items and avatar fallbacks are UI configuration, NOT business data.
 * They define icon, label, and path – values that belong to the frontend,
 * not to the backend domain model.
 *
 * Rules:
 *  – Do NOT add business data here (orders, products, customers, etc.)
 *  – Do NOT call APIs from this module
 *  – Adding a new nav item here requires a corresponding route in router.tsx
 */

import {
  Activity,
  Archive,
  Box,
  ChartNoAxesColumnIncreasing,
  Grid2x2,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  ShoppingCart,
  Shapes,
  SquareChartGantt,
  Store,
  Ticket,
  Truck,
  UserCog,
  Users
} from 'lucide-react';
import type { NavItem, TopbarUser } from '../shared/types/admin.js';

// ---------------------------------------------------------------------------
// Navigation configurations
// Each variant maps 1:1 to an AdminShell `variant` prop value.
// ---------------------------------------------------------------------------

/** Full retail/operations-facing navigation. Default shell variant. */
export const retailNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  {
    label: 'Products',
    path: '/products',
    icon: Store,
    children: [
      { label: 'All Products', path: '/products' },
      { label: 'Add Product', path: '/products?action=new' },
    ],
  },
  { label: 'Categories', path: '/categories', icon: Grid2x2 },
  { label: 'Inventory', path: '/inventory', icon: Box },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesColumnIncreasing },
  { label: 'Notifications', path: '/notifications', icon: MessageSquareText },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

/** Catalog management navigation (Products + Categories focus). */
export const catalogNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  {
    label: 'Products',
    path: '/products',
    icon: Archive,
    children: [
      { label: 'All Products', path: '/products' },
      { label: 'Add Product', path: '/products?action=new' },
    ],
  },
  { label: 'Categories', path: '/categories', icon: Shapes },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesColumnIncreasing },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

/** Operations-focused navigation (Orders + Inventory + Users). */
export const operationsNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/inventory', icon: Box },
  { label: 'Users', path: '/customers', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: SquareChartGantt },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

/** Procurement navigation (Purchase Orders + Suppliers + Inventory). */
export const procurementNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/inventory', icon: Box },
  { label: 'Users', path: '/suppliers', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: SquareChartGantt },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

// ---------------------------------------------------------------------------
// Shell user fallbacks
// These are UI placeholder values displayed before the auth profile API resolves.
// The live name and role are always overridden by the authenticated user's profile.
// ---------------------------------------------------------------------------

/**
 * UI fallback profiles keyed by shell variant.
 * `name` and `role` are overridden at runtime by the authenticated session.
 * `avatar` is a static asset URL used as a fallback before the profile loads.
 */
export const adminUsers = {
  main: {
    name: 'Admin User',
    role: 'SUPER ADMIN',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4aka1ymojT-vWSqRZ1G7gTKyzvOPL-I2FN4CigyzdORH7OFXtsN5Qu_SG7mLOLk7sLi1Q_XeeKApeeeaEakacBWTlOtLXxv64-nAHuPas7Z12pfWh5zs1Mgq7tLuEkwcScc7i-zdD3LdJbM3OaUoqM3e6ka8VEbjH0zogHUDIqWgl1zoi7z35dYb32GavcxfLgpo3sZWOMio6bp6fq7MgqomnRSImErWsq6mISj86yNw-YNWBSUpfsCI7m6OuqSWEaYhcUWTN7Gx8'
  },
  alex: {
    name: 'Alex Rivera',
    role: 'Super Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1gDdYIXL1bnyQ5EN1YfylARskFYTnhklRQK2IKptmNeL4c2vFZ_AIPV-kRh45nrEbP4cqJRQwGlMXQ10uKjF56V8ocpRtXww2YHzpWmJ4iXBaIHLRxPtjaNu9m5IBK9d423vchSAloRVYjbFxwJktrYY7_wBGZktV8WG2P2Oa-40EG2Enjlv0vzTAx5jh9ShI06h9zFlS1vK1S9QYCyI9T7RVH7jV_U0EU2YLAKSnBmmdFj9paBOhzrtNhhX4KTUNbGhrXBsgYd6H'
  },
  sarah: {
    name: 'Sarah Jenkins',
    role: 'Administrator Profile',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD67B3GPw8xZHbYD31bMzAyhT_PXQXzJF5pvA7Sy4M1T33wtdrpwR_ueurq4hQ6TKxDz7vvGS6ieUr-jRH4pllB-fz7KvhYm4SgcVEXMrcIDR3Cbscblc_Q219sEn604TbSZ32q0nRXI7TOdFNX5yQqcf7CSzJHy958Kr0OHcHQE4N4LZa_9ZttCHQo6BGIGN4c7Lf9dpf23U5bWnLKq0sN5S53Xurbrb2yeL9Up4X5jfz343Hgbz0ZP2sUbOd1QMXSWhB16hpXAyzp'
  },
  office: {
    name: 'Admin User',
    role: 'MAIN OFFICE',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZcy3huHp_dAMO_bgACfuIxgINOMChP-B8RLDJISGFk4i04zOJXv1CH7FgvBrUTBxdlqlT38WAKGKseFO4ly8G8S497gtwbtlMkLht4bR7dkBqyqOfNyCPb8eX4WGwnqfgNEHUcrHVhqtmziNy1EhHg0kEroyEL_jACbEssDFUTQhR8Wqp8TVuUp4IHjbeo2c44OAn4CdOpiy_NNIsrJknGEG-h624YQp0NjZxl8yyM76mUCFUH1ExS7FqDaIcQ6JJ2UftfjlyCY2'
  },
  catalog: {
    name: 'Admin User',
    role: 'SUPER ADMIN',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8EcIVISAfVc9wLbk7qnRvatyjpM-l3xTt-DY-euUErTnr_Yx7n8fqF5yiHEdrQyVmIA4KKmr07ANMNyFRw1GDrlQgzhpAhUqfPX3kTB7le6idrY3XdtKTtZh3b30NwBXm-Eu0G_YmIAwx1TreZnbWfqrxZm2Tm9HOIx0fMMxUd0_YVU0xa_DQ47O_58vXF0g5j9IW_NbG51lTv0EW3jVKufWuEgapz7a1PSMF65rbygRqoBw64k58W5LGk582PJEwr5HEy-qGSM'
  },
  categories: {
    name: 'FreshMart Admin',
    role: 'Master Account',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZTL3MCOwaGVzn6ocQ2C5A-t3YKLlnaTxE2dc5m2jfjm29ImrfS2BxP9FADscD5Yz31HL5CNETY9ODQZgyFEI3oldKsDGckjXeyT06tJP11bCkpWsduPywEY-3TZLgCeI4WTwdrk3-wDfCpDHaoU-kXGPBZ30bR9YgA0BUEdh8amUNULI4iyCGGPpAdObVnXaqjw5Oku5s0yK0f5KOfGuE4wbiM9rPChww33ATKEVzA94rIhtfyzudhZfe1jNPSRL-oIBkmjje79fy'
  },
  procurement: {
    name: 'Admin User',
    role: 'Procurement Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCpFvWM1E5FYTZiXA3D34NL9H32qQgOB3ETq5276P1AnuyVmDRCE-ggP-8HSHeRj_cRYeBRU6sg56-Gkamcg0Nk7XiAczAk5KuldvzNBKZHlObGVVuaWQi22xif9LvRd9Iw3wPdngpMZIKUCRk_fRXleqwQI1W9bZnvVKFtxIlIscVobcBFw_co2dF9ca3qToJXwOjmGtdnMdY06X7dVXuC7DhyYF_AEcBEMoNKzvIXrpkr9JlFLS65eLgNXt9raYhErDkaJ_YdC5b'
  }
} satisfies Record<string, TopbarUser>;
