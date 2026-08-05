import type { LucideIcon } from 'lucide-react';
import { CircleAlert, Loader2, PackageOpen, RefreshCw } from 'lucide-react';
import { cn } from '@freshmart/design-system';
import type { ApiResourceState } from '../hooks/use-api-resource.js';

type ResourceStateProps = {
  className?: string;
  actionLabel?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  errorDescription?: string;
  errorTitle?: string;
  icon?: LucideIcon;
  loadingLabel?: string;
  onRetry?: () => void;
  onAction?: () => void;
  rows?: number;
  skeletonClassName?: string;
  secondaryText?: string;
  state: Exclude<ApiResourceState, 'ready'>;
};

export const AdminResourceState = ({
  actionLabel,
  className = '',
  emptyDescription = 'Adjust the current filters and try again.',
  emptyTitle = 'No results found',
  errorDescription = 'Check the connection and try again.',
  errorTitle = 'Content could not be loaded',
  icon: EmptyIcon = PackageOpen,
  loadingLabel = 'Loading content',
  onRetry,
  onAction,
  rows = 4,
  skeletonClassName = 'admin-resource-row-skeleton',
  secondaryText,
  state
}: ResourceStateProps) => {
  if (state === 'loading') {
    return (
      <div className={cn(className, 'admin-resource-state-loading')} role="status" aria-busy="true" aria-label={loadingLabel}>
        <div className="admin-resource-state-shell w-full">
          <div className="admin-resource-state-hero">
            <span className="admin-resource-state-icon admin-resource-state-icon-loading" aria-hidden="true">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
            <div>
              <strong>{loadingLabel}</strong>
              <span>{secondaryText ?? 'FreshMart is preparing the latest records.'}</span>
            </div>
          </div>
          <div className="admin-resource-state-rows">
            {Array.from({ length: rows }, (_, index) => <span className={skeletonClassName} key={index} />)}
          </div>
        </div>
      </div>
    );
  }

  const isError = state === 'error';
  const Icon = isError ? CircleAlert : EmptyIcon;
  return (
    <div className={cn(className, 'admin-resource-state-shell w-full')} role={isError ? 'alert' : 'status'}>
      <div className="admin-resource-state-hero">
        <span className={cn('admin-resource-state-icon', isError ? 'admin-resource-state-icon-error' : 'admin-resource-state-icon-empty')} aria-hidden="true">
          <Icon />
        </span>
        <div>
          <strong>{isError ? errorTitle : emptyTitle}</strong>
          <span>{isError ? errorDescription : emptyDescription}</span>
          {secondaryText ? <small>{secondaryText}</small> : null}
        </div>
      </div>
      {(isError && onRetry) || (!isError && actionLabel && onAction) ? (
        <button
          className={cn('admin-resource-state-action', isError && 'danger')}
          onClick={isError ? onRetry : onAction}
          type="button"
        >
          {isError ? <RefreshCw aria-hidden="true" /> : null}
          {isError ? 'Retry' : actionLabel}
        </button>
      ) : null}
    </div>
  );
};
