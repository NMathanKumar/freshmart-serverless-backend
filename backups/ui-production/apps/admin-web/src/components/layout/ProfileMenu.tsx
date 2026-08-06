import React from 'react';
import { DropdownMenu, type DropdownMenuItem } from '../ui/dropdown-menu';
import { Avatar } from '../ui/avatar';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, ShieldCheck, LogOut, ExternalLink } from 'lucide-react';

export interface ProfileMenuProps {
  onNavigate?: (path: string) => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const menuItems: DropdownMenuItem[] = [
    {
      id: 'profile',
      label: 'Admin Profile',
      icon: <User className="w-4 h-4 text-emerald-400" />,
      onClick: () => onNavigate?.('/settings'),
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: <Settings className="w-4 h-4 text-teal-400" />,
      onClick: () => onNavigate?.('/settings'),
    },
    {
      id: 'security',
      label: 'Security & Audit',
      icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
      onClick: () => onNavigate?.('/reports'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <DropdownMenu
      align="right"
      items={menuItems}
      trigger={
        <button className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-colors text-left">
          <Avatar name={user?.name || 'Admin'} status="online" size="sm" />
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Enterprise Admin'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@freshmart.com'}</p>
          </div>
        </button>
      }
    />
  );
};
