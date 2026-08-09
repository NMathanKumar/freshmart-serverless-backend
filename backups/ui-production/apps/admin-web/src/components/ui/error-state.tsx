import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'Failed to load requested data. Please try again or check system connection.',
  onRetry,
}) => (
  <div className="w-full py-14 px-6 glass-card border border-rose-500/30 rounded-2xl flex flex-col items-center justify-center text-center">
    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/20">
      <AlertTriangle className="w-8 h-8" />
    </div>
    <h4 className="text-base font-bold text-slate-100">{title}</h4>
    <p className="text-xs text-rose-300/80 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
        Retry Connection
      </Button>
    )}
  </div>
);
