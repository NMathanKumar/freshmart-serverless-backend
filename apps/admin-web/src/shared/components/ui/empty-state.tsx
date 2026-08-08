import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no records matching your request right now.',
  actionLabel,
  onAction,
  icon = <PackageOpen className="w-12 h-12 text-slate-500" />,
}) => (
  <div 
    className="w-full py-16 px-6 glass-card rounded-2xl flex flex-col items-center justify-center text-center"
    role="status"
    aria-live="polite"
  >
    <div className="p-4 rounded-full bg-slate-800/80 mb-4 border border-slate-700/60">{icon}</div>
    <h4 className="text-base font-bold text-slate-200">{title}</h4>
    <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
