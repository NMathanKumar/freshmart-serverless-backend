import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeSession } from '@freshmart/shared';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        initializeSession();
        navigate('/admin/dashboard', { replace: true });
      } catch (err) {
        console.error('Auth callback failed:', err);
        navigate('/admin/login', { replace: true });
      }
    };
    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
        <div className="w-12 h-12 border-4 border-[#04883b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Authenticating...</h2>
        <p className="text-sm text-slate-500 mt-1">Completing secure sign in to FreshMart Admin</p>
      </div>
    </div>
  );
};
