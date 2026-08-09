import type { LucideIcon } from 'lucide-react';
import { CircleAlert, PackageOpen, RefreshCw } from 'lucide-react';
import type { ApiResourceState } from '../hooks/use-api-resource.js';

type ResourceStateProps = {
  className?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  errorDescription?: string;
  errorTitle?: string;
  icon?: LucideIcon;
  loadingLabel?: string;
  onRetry?: () => void;
  rows?: number;
  skeletonClassName?: string;
  state: Exclude<ApiResourceState, 'ready'>;
};

export const AdminResourceState = ({
  className = 'admin-resource-state',
  emptyDescription = 'Adjust the current filters and try again.',
  emptyTitle = 'No results found',
  errorDescription = 'Check the connection and try again.',
  errorTitle = 'Content could not be loaded',
  icon: EmptyIcon = PackageOpen,
  loadingLabel = 'Loading content',
  onRetry,
  rows = 4,
  skeletonClassName = 'admin-resource-row-skeleton',
  state
}: ResourceStateProps) => {
  if (state === 'loading') {
    return (
      <div className={className} role="status" aria-busy="true" aria-label={loadingLabel}>
        {Array.from({ length: rows }, (_, index) => <span className={skeletonClassName} key={index} />)}
      </div>
    );
  }

  const isError = state === 'error';
  const Icon = isError ? CircleAlert : EmptyIcon;
  return (
    <div className={className} role={isError ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <strong>{isError ? errorTitle : emptyTitle}</strong>
      <span>{isError ? errorDescription : emptyDescription}</span>
      {isError && onRetry ? <button onClick={onRetry} type="button"><RefreshCw aria-hidden="true" />Retry</button> : null}
    </div>
  );
};
