import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, onNavigate }) => {
  return (
    <nav className={cn('flex items-center gap-1.5 text-xs text-slate-400', className)}>
      <button
        onClick={() => onNavigate?.('/')}
        className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-200 truncate">{item.label}</span>
            ) : (
              <button
                onClick={() => item.href && onNavigate?.(item.href)}
                className="hover:text-emerald-400 transition-colors truncate"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
