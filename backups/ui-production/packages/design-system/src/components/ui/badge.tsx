import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'offer';

const tones: Record<BadgeTone, string> = {
  danger: 'bg-[#ffdad6] text-[#93000a]',
  neutral: 'border border-[#bdcaba] bg-[#e3eadf] text-[#3e4a3d]',
  offer: 'bg-[#c74668] text-white',
  success: 'bg-[#00873a] text-white',
  warning: 'bg-[#ffd9de] text-[#8a143c]'
};

export const Badge = ({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide', tones[tone], className)} {...props} />
);
