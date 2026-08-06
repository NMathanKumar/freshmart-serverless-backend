import React from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Truck,
  Ticket,
  BarChart3,
  Star,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Building2,
  ArrowRightLeft,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

export const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', path: '/orders', icon: ShoppingCart },
  { id: 'fulfillment', label: 'Fulfillment', path: '/fulfillment', icon: Package },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package },
  { id: 'forecast', label: 'Forecasting & Replenishment', path: '/inventory/forecast', icon: BarChart3 },
  { id: 'transfers', label: 'Transfers', path: '/transfers', icon: ArrowRightLeft },
  { id: 'vendor-invoices', label: 'Vendor Invoices', path: '/vendor-invoices', icon: FileText },
  { id: 'vendor-returns', label: 'Vendor Returns', path: '/vendor-returns', icon: RotateCcw },
  { id: 'warehouses', label: 'Warehouses', path: '/warehouses', icon: Building2 },
  { id: 'movements', label: 'Ledger', path: '/inventory/movements', icon: RefreshCw },
  { id: 'products', label: 'Products', path: '/products', icon: Package },
  { id: 'categories', label: 'Categories', path: '/categories', icon: Tags },
  { id: 'users', label: 'Users', path: '/customers', icon: Users },
  { id: 'delivery', label: 'Delivery', path: '/delivery', icon: Truck },
  { id: 'coupons', label: 'Coupons', path: '/coupons', icon: Ticket },
  { id: 'reviews', label: 'Reviews', path: '/reviews', icon: Star },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { id: 'procurement-analytics', label: 'Procurement Analytics', path: '/procurement-analytics', icon: BarChart3 },
];

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  className,
}) => {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-[#e9f2e7] transition-all duration-300 z-30 h-screen sticky top-0 shadow-xs select-none overflow-hidden shrink-0 justify-between',
        collapsed ? 'w-20' : 'w-56',
        className
      )}
    >
      {/* 1. Fixed Top Logo Header */}
      <div className="px-5 py-5 border-b border-[#f0f7ee] shrink-0 bg-white">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('/')}
        >
          <div className="w-8 h-8 rounded-xl bg-[#04883b] flex items-center justify-center shadow-sm shadow-[#04883b]/20 shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="font-extrabold text-sm leading-tight text-[#04883b]">
                FreshMart Admin
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 block">
                Enterprise Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Theme Styled Internal Scrollable Navigation Menu */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (item.path !== '/' && currentPath.startsWith(item.path));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group relative',
                isActive
                  ? 'bg-[#e8f5e5] text-[#04883b] font-bold'
                  : 'text-slate-600 hover:text-[#04883b] hover:bg-[#f4fcf0]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-[#04883b]' : 'text-slate-500 group-hover:text-[#04883b]'
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#04883b] rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Fixed Bottom Section — Pure Logout Action Only */}
      <div className="p-4 border-t border-[#f0f7ee] bg-white shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all duration-150 border border-rose-100 shadow-xs"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
