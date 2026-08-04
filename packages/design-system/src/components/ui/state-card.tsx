import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn.js';
import { Button } from './button.js';

export interface StateCardProps {
  action?: ButtonHTMLAttributes<HTMLButtonElement>;
  actionLabel?: string;
  className?: string;
  description: string;
  eyebrow?: string;
  image?: ReactNode;
  title: string;
  tone?: 'primary' | 'danger' | 'secondary' | 'neutral';
}

const toneStyles = {
  danger: 'bg-[#ffdad6]/20 text-[#93000a]',
  neutral: 'bg-[#e9f0e5] text-[#3e4a3d]',
  primary: 'bg-[#e9f0e5] text-[#006b2c]',
  secondary: 'bg-[#82f5c1]/20 text-[#006c4a]'
};

export const StateCard = ({ action, actionLabel, className, description, eyebrow, image, title, tone = 'primary' }: StateCardProps) => (
  <section className={cn('flex min-h-[420px] flex-col items-center justify-between rounded-3xl border border-[#bdcaba]/30 bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]', className)}>
    <div className="mb-6 flex w-full flex-1 items-center justify-center">
      <div className={cn('group relative flex h-48 w-48 items-center justify-center rounded-full', toneStyles[tone])}>
        <div className="absolute inset-0 scale-110 rounded-full bg-current opacity-5 transition-transform duration-500 group-hover:scale-125" />
        {image}
      </div>
    </div>
    <div>
      {eyebrow && <div className={cn('mb-1 text-sm font-bold uppercase tracking-widest', tone === 'danger' ? 'text-[#ba1a1a]' : tone === 'secondary' ? 'text-[#006c4a]' : 'text-[#006b2c]')}>{eyebrow}</div>}
      <h2 className="mb-3 text-xl font-semibold text-[#171d16]">{title}</h2>
      <p className="mb-6 text-base leading-6 text-[#3e4a3d]">{description}</p>
      {actionLabel && <Button className="w-full rounded-full px-8 py-3" type="button" {...action}>{actionLabel}</Button>}
    </div>
  </section>
);
