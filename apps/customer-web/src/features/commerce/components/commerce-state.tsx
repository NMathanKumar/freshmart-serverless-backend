import { Button } from '@freshmart/design-system';
import { AlertTriangle, Heart, PackageSearch, RefreshCw, ShoppingBasket } from 'lucide-react';

export const CommerceState = ({
  actionLabel = 'Retry',
  description,
  icon = 'error',
  onAction,
  title
}: {
  actionLabel?: string;
  description: string;
  icon?: 'error' | 'empty' | 'wishlist' | 'cart';
  onAction?: () => void;
  title: string;
}) => {
  const Icon = icon === 'wishlist' ? Heart : icon === 'cart' ? ShoppingBasket : icon === 'empty' ? PackageSearch : AlertTriangle;

  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center commerce-shadow" role={icon === 'error' ? 'alert' : 'status'}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eff6ea] text-[#006b2c]">
        <Icon aria-hidden="true" className="h-10 w-10" />
      </div>
      <h2 className="mb-3 text-3xl font-bold text-[#171d16]">{title}</h2>
      <p className="mb-8 max-w-md text-lg text-[#3e4a3d]">{description}</p>
      {onAction && <Button className="gap-2 rounded-full px-8 py-4" onClick={onAction} type="button"><RefreshCw aria-hidden="true" className="h-4 w-4" />{actionLabel}</Button>}
    </section>
  );
};

export const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading products">
    {Array.from({ length: count }).map((_, index) => (
      <div className="commerce-card space-y-4 p-4" key={index}>
        <div className="aspect-square rounded-lg commerce-skeleton" />
        <div className="h-4 w-1/2 rounded commerce-skeleton" />
        <div className="h-6 w-3/4 rounded commerce-skeleton" />
        <div className="h-4 w-1/3 rounded commerce-skeleton" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-7 w-16 rounded commerce-skeleton" />
          <div className="h-10 w-24 rounded-lg commerce-skeleton" />
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading list">
    {Array.from({ length: count }).map((_, index) => (
      <div className="commerce-card flex flex-col gap-4 p-4 sm:flex-row" key={index}>
        <div className="h-32 w-full rounded-xl commerce-skeleton sm:w-32" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-6 w-2/3 rounded commerce-skeleton" />
          <div className="h-4 w-1/3 rounded commerce-skeleton" />
          <div className="mt-auto flex items-center justify-between">
            <div className="h-10 w-28 rounded-full commerce-skeleton" />
            <div className="h-5 w-32 rounded commerce-skeleton" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
