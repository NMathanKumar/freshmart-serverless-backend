import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'glass' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  className,
  ...props
}) => {
  const variants = {
    white: 'bg-white border border-[#e9f2e7] rounded-2xl shadow-sm hover:shadow-md transition-shadow',
    glass: 'bg-white/80 backdrop-blur-md border border-[#e9f2e7] rounded-2xl shadow-sm',
    outline: 'bg-transparent border border-slate-200 rounded-2xl',
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('px-6 py-4 border-b border-slate-100 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-base font-bold text-slate-800', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-xs text-slate-500 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl', className)} {...props}>
    {children}
  </div>
);
