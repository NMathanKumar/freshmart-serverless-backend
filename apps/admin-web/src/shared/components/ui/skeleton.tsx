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
      aria-hidden="true"
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
    <div aria-hidden="true" className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden animate-pulse">
      {/* Header bar */}
      <div className="bg-[#f0f7ee] px-6 py-4 border-b border-[#e9f2e7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
        <Skeleton className="w-32 h-4 rounded" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-1/4">
              <Skeleton variant="circular" className="w-8 h-8 shrink-0" />
              <div className="space-y-1.5 w-full">
                <Skeleton className="w-3/4 h-3.5" />
                <Skeleton className="w-1/2 h-2.5" />
              </div>
            </div>
            {Array.from({ length: columns - 2 }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="w-16 h-3.5 rounded-full hidden sm:block" />
            ))}
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-[#f4fcf0]/50">
        <Skeleton className="w-40 h-3.5" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="w-28 h-3.5" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton className="w-36 h-8" />
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Skeleton className="w-12 h-5 rounded-full" />
        <Skeleton className="w-24 h-3" />
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
