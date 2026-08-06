import { cn } from '../../lib/cn.js';

export const Progress = ({ className, value }: { className?: string; value: number }) => (
  <div
    aria-valuemax={100}
    aria-valuemin={0}
    aria-valuenow={Math.max(0, Math.min(100, value))}
    className={cn('h-3 w-full overflow-hidden rounded-full bg-[#e9f0e5]', className)}
    role="progressbar"
  >
    <div className="h-full rounded-full bg-[#006b2c] transition-[width] duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);
