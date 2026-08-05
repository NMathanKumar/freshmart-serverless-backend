import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ className?: string; label?: string }> = ({
  className,
  label = 'Loading data...',
}) => (
  <div
    className={`w-full rounded-[28px] border border-[var(--admin-outline-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,242,0.9))] px-6 py-14 shadow-[0_14px_40px_rgba(7,48,16,0.06)] ${className ?? ''}`}
  >
    <div className="mx-auto flex max-w-[420px] flex-col items-center gap-4 text-center text-[var(--admin-muted)]">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#dbe7d8] bg-[#e8f5e5] text-[var(--admin-primary)] shadow-[0_10px_25px_rgba(7,48,16,0.08)]">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
      <div>
        <div className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--admin-text)]">{label}</div>
        <p className="mt-2 text-[14px] leading-6">FreshMart is preparing the latest records and table details.</p>
      </div>
      <div className="w-full space-y-3 pt-2">
        <span className="block h-4 w-full rounded-full bg-[#eef3eb]" />
        <span className="block h-4 w-5/6 rounded-full bg-[#eef3eb]" />
        <span className="block h-4 w-2/3 rounded-full bg-[#eef3eb]" />
      </div>
    </div>
  </div>
);
