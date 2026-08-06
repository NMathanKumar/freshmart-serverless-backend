import * as React from 'react';
import { cn } from '../../lib/cn.js';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--foreground-muted)] focus:ring-2 focus:ring-[color:var(--color-fresh-500)]',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
