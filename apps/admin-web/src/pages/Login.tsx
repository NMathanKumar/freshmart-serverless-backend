import React, { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const customerLoginUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5174/login'
    : '/login';

  const handleRedirect = () => {
    window.location.assign(customerLoginUrl);
  };

  useEffect(() => {
    // Automatically redirect to the unified Auth Portal if accessed directly
    const timer = setTimeout(() => {
      handleRedirect();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4fcf0] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-[#e9f2e7]">
        <h1 className="text-2xl font-extrabold text-[#0f172a] mb-2">FreshMart Admin</h1>
        <p className="text-sm text-slate-500 mb-8">Redirecting to FreshMart Unified Sign In...</p>
        <Button onClick={handleRedirect} className="w-full h-12 text-base font-bold" leftIcon={<LogIn className="w-5 h-5" />}>
          Proceed to Sign In
        </Button>
      </div>
    </div>
  );
};
