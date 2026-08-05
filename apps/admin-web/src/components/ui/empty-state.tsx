import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  className?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryText?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  title = 'No items found',
  description = 'There are no records matching your request right now.',
  actionLabel,
  onAction,
  secondaryText,
  icon = <PackageOpen className="w-12 h-12 text-slate-500" />,
}) => (
  <div
    className={`w-full rounded-[28px] border border-[var(--admin-outline-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,242,0.92))] px-6 py-14 text-center shadow-[0_14px_40px_rgba(7,48,16,0.06)] sm:px-10 ${className ?? ''}`}
  >
    <div className="mx-auto flex max-w-[520px] flex-col items-center">
      <div className="mb-5 inline-flex h-18 w-18 items-center justify-center rounded-[24px] border border-[#dbe7d8] bg-[#e8f5e5] text-[var(--admin-primary)] shadow-[0_10px_25px_rgba(7,48,16,0.07)]">
        {icon}
      </div>
      <h4 className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">{title}</h4>
      <p className="mt-3 max-w-[420px] text-[16px] leading-7 text-[#4e5b4d]">{description}</p>
      {secondaryText ? <p className="mt-2 max-w-[400px] text-[13px] leading-6 text-[var(--admin-muted)]">{secondaryText}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-8 min-w-[180px]" variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  </div>
);
