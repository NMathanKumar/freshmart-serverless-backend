import { cn } from '../../lib/cn.js';

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      'animate-pulse rounded-2xl bg-[linear-gradient(90deg,var(--surface-subtle),var(--surface-muted),var(--surface-subtle))]',
      className
    )}
  />
);
