import React from 'react';
import { Search, Bell, HelpCircle, Menu, X } from 'lucide-react';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobileOpen,
  onToggleMobile,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="h-16 border-b border-[#e9f2e7] bg-[#f4fcf0]/95 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Left Search Bar (Figma Pill) */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl bg-white text-slate-600 border border-slate-200"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders, inventory, customers..."
            className="w-full bg-[#e8f3e5]/60 border border-[#d6e8d2] rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-[#04883b] transition-all font-medium"
          />
        </div>
      </div>

      {/* Right User & Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors relative" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#04883b]" />
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors" title="Help">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#0f172a] leading-tight">Alex Rivera</p>
            <p className="text-[10px] font-semibold text-slate-400 leading-tight">Regional Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
