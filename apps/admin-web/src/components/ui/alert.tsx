import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onDismiss,
  className,
  ...props
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
  };

  const config = configs[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed',
        config.bg,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div>
          {title && <h5 className="font-bold text-slate-100 mb-0.5">{title}</h5>}
          <div>{children}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
