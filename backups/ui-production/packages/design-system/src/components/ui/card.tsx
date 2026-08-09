import type { PropsWithChildren } from 'react';
import { cn } from '../../lib/cn.js';

export const Card = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <section
    className={cn(
      'rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]',
      className
    )}
  >
    {children}
  </section>
);
