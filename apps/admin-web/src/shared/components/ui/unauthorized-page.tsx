import React from 'react';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">403</h1>
          <h2 className="text-base font-bold text-slate-700">Access Denied</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current user account does not have administrative privileges to access this area. Please switch to an authorized admin account.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-white text-xs font-bold shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Store</span>
          </a>
          <a
            href="/login"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Switch Account</span>
          </a>
        </div>
      </div>
    </main>
  );
};
