import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

export type AlertTone = 'success' | 'danger' | 'info';

const tones: Record<AlertTone, string> = {
  danger: 'border-[#ba1a1a] bg-[#ffdad6]/30 text-[#93000a]',
  info: 'border-[#006c4a] bg-[#82f5c1]/20 text-[#005137]',
  success: 'border-[#006b2c] bg-[#f4fcf0] text-[#006b2c]'
};

export const Alert = ({
  children,
  className,
  icon,
  tone = 'success',
  ...props
}: HTMLAttributes<HTMLDivElement> & { icon?: ReactNode; tone?: AlertTone }) => (
  <div className={cn('flex items-center gap-3 rounded-r-xl border-l-4 p-4 text-sm font-semibold shadow-sm', tones[tone], className)} role={tone === 'danger' ? 'alert' : 'status'} {...props}>
    {icon}
    <div>{children}</div>
  </div>
);
