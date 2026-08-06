import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: '-top-8 left-1/2 -translate-x-1/2',
    bottom: '-bottom-8 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -translate-y-1/2 -left-2 -translate-x-full',
    right: 'top-1/2 -translate-y-1/2 -right-2 translate-x-full',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-[10px] font-semibold text-slate-100 bg-slate-800 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in duration-150',
            positions[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
