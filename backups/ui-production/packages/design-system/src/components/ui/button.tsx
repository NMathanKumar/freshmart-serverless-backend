import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-fresh-500)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[color:var(--color-fresh-500)] px-4 py-2.5 text-white shadow-lg shadow-[color:rgba(26,127,55,0.22)] hover:bg-[color:var(--color-fresh-600)]',
        secondary: 'bg-[color:var(--surface-subtle)] px-4 py-2.5 text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]',
        ghost: 'px-4 py-2.5 text-[color:var(--foreground)] hover:bg-[color:var(--surface-subtle)]'
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-5',
        lg: 'h-12 px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ size, variant }), className)} {...props} />
  )
);

Button.displayName = 'Button';
