import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { LogIn, ShieldCheck } from 'lucide-react';
import { saveSharedSession } from '@freshmart/shared';

export const Login: React.FC = () => {
  const { login } = useAuth();
  
  const handleDemoLogin = () => {
    saveSharedSession({
      accessToken: 'admin-demo-access-token',
      idToken: 'admin-demo-id-token',
      refreshToken: 'admin-demo-refresh-token',
      user: {
        userId: 'admin-1',
        email: 'admin@freshmart.com',
        fullName: 'Alex Rivera (Admin)',
        role: 'ADMIN',
        roles: ['ADMIN'],
        groups: ['ADMIN']
      }
    });
    window.location.assign('/admin/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4fcf0] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-[#e9f2e7]">
        <h1 className="text-2xl font-extrabold text-[#0f172a] mb-2">FreshMart Admin</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to access your management dashboard.</p>
        
        <div className="space-y-3">
          <Button onClick={login} className="w-full h-12 text-base font-bold" leftIcon={<LogIn className="w-5 h-5" />}>
            Sign in with SSO
          </Button>

          <Button 
            onClick={handleDemoLogin} 
            variant="outline"
            className="w-full h-11 text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50" 
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          >
            Demo Admin Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

