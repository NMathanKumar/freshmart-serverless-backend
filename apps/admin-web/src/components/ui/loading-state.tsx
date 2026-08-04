import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading data...' }) => (
  <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    <span className="text-xs font-medium">{label}</span>
  </div>
);
