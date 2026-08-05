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
  <div className="w-full rounded-[28px] border border-rose-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,247,0.96))] px-6 py-14 text-center shadow-[0_14px_40px_rgba(183,28,54,0.08)]">
    <div className="mx-auto flex max-w-[420px] flex-col items-center">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[22px] border border-rose-200 bg-rose-50 text-rose-600 shadow-[0_10px_25px_rgba(183,28,54,0.08)]">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h4 className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">{title}</h4>
      <p className="mt-3 max-w-sm text-[15px] leading-6 text-[#7d4551]">{description}</p>
    </div>
    {onRetry && (
      <Button className="mt-8 min-w-[180px]" variant="danger" size="md" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
        Retry Connection
      </Button>
    )}
  </div>
);
