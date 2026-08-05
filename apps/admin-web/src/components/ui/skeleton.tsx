import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  className,
  ...props
}) => {
  const variants = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn('shimmer-skeleton border border-[#e2efe0]/50', variants[variant], className)}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 7,
}) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--admin-outline-soft)] bg-white/95 shadow-[0_12px_32px_rgba(7,48,16,0.06)] animate-pulse">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--admin-outline-soft)] bg-[#f4faef] px-6 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>
        <Skeleton className="h-4 w-36 rounded-full" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#eef3eb]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 px-6 py-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-1/2 rounded-full" />
              </div>
            </div>
            {Array.from({ length: Math.max(columns - 2, 0) }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="hidden h-4 w-16 rounded-full sm:block" />
            ))}
            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--admin-outline-soft)] bg-[#f7fbf3] px-6 py-5">
        <Skeleton className="h-4 w-44 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 rounded-[28px] border border-[var(--admin-outline-soft)] bg-white/95 p-6 shadow-[0_12px_32px_rgba(7,48,16,0.06)] animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>
      <Skeleton className="h-8 w-36 rounded-full" />
      <div className="flex items-center gap-2 border-t border-[#eef3eb] pt-4">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-3 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#e0ede0] opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#04883b] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide">{message}</p>
    </div>
  );
};
