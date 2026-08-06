import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPath, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4fcf0] text-[#0f172a] flex flex-col md:flex-row antialiased selection:bg-[#04883b] selection:text-white">
      {/* Desktop Sidebar (Fixed 100vh height, internal nav scroll, pinned bottom logout) */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          onNavigate(path);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        className="hidden md:flex shrink-0 h-screen sticky top-0"
      />

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-white border-r border-[#e9f2e7] h-full flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              currentPath={currentPath}
              onNavigate={(path) => {
                onNavigate(path);
                setMobileOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileOpen(false)}
              className="w-full flex"
            />
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#f4fcf0]">
        {/* Top Header (Fixed at top) */}
        <Header
          currentPath={currentPath}
          onNavigate={onNavigate}
          mobileOpen={mobileOpen}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Page Content Body (Scrolls independently beneath fixed top header) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto bg-[#f4fcf0]">
          {children}
        </main>
      </div>
    </div>
  );
};
