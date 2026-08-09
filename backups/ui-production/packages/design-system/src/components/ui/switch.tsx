import * as React from 'react';
import { cn } from '../../lib/cn.js';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => (
    <label className={cn('inline-flex cursor-pointer items-center gap-3', className)}>
      <span className="sr-only">{label ?? props['aria-label'] ?? 'Toggle setting'}</span>
      <input ref={ref} className="peer sr-only" type="checkbox" {...props} />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 rounded-full bg-[color:var(--surface-muted,#dde5d9)] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-slate-200 after:bg-white after:transition-transform peer-checked:bg-[color:var(--color-fresh-500,#006b2c)] peer-checked:after:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--color-fresh-500,#006b2c)]"
      />
      {label && <span className="text-sm font-medium text-[color:var(--foreground-muted,#3e4a3d)]">{label}</span>}
    </label>
  )
);

Switch.displayName = 'Switch';
