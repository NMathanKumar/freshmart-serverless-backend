import { Button, Skeleton } from '@freshmart/design-system';
import { PackageOpen, RotateCw } from 'lucide-react';

export const SectionSkeleton = ({
  cards = 4,
  className = 'grid grid-cols-2 gap-4 md:grid-cols-4',
}: {
  cards?: number;
  className?: string;
}) => (
  <div aria-busy="true" aria-label="Loading section" className={className}>
    {Array.from({ length: cards }, (_, index) => (
      <Skeleton className="h-64 w-full rounded-xl" key={index} />
    ))}
  </div>
);

export const SectionError = ({ retry }: { retry: () => void }) => (
  <div
    className="rounded-xl border border-[#ba1a1a]/20 bg-[#ffdad6] p-6 text-center"
    role="alert"
  >
    <p className="font-semibold text-[#93000a]">
      This section could not be loaded.
    </p>
    <Button className="mt-4 bg-[#006b2c]" onClick={retry} size="sm">
      <RotateCw aria-hidden="true" className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

export const SectionEmpty = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-[#bdcaba] bg-[#eff6ea] p-8 text-center text-[#3e4a3d]">
    <PackageOpen aria-hidden="true" className="mx-auto mb-3 h-8 w-8" />
    <p>{message}</p>
  </div>
);
