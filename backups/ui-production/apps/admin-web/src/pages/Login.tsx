import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4fcf0] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-[#e9f2e7]">
        <h1 className="text-2xl font-extrabold text-[#0f172a] mb-2">FreshMart Admin</h1>
        <p className="text-sm text-slate-500 mb-8">Sign in with SSO to access your dashboard.</p>
        <Button onClick={login} className="w-full h-12 text-base font-bold" leftIcon={<LogIn className="w-5 h-5" />}>
          Sign in with SSO
        </Button>
      </div>
    </div>
  );
};
