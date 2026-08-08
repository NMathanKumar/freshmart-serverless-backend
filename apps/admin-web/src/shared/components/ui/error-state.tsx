import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  errorCode?: string;
  correlationId?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'Failed to load requested data. Please try again or check system connection.',
  onRetry,
  errorCode,
  correlationId,
}) => (
  <div 
    className="w-full py-14 px-6 bg-white border border-rose-200 rounded-2xl flex flex-col items-center justify-center text-center focus:outline-none"
    role="alert"
    aria-live="assertive"
    tabIndex={-1}
  >
    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-200">
      <AlertTriangle className="w-8 h-8" />
    </div>
    <h4 className="text-base font-bold text-slate-800">{title}</h4>
    <p className="text-xs text-slate-600 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
    
    {(errorCode || (correlationId && import.meta.env.DEV)) && (
      <div className="flex flex-col gap-1 mb-6 text-[10px] text-slate-500 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        {errorCode && <span>Error Code: {errorCode}</span>}
        {correlationId && import.meta.env.DEV && <span>Ref: {correlationId}</span>}
      </div>
    )}

    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
        Retry Connection
      </Button>
    )}
  </div>
);
