import React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  };

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative rounded-full transition-colors duration-200 ease-in-out p-0.5',
          sizes[size].track,
          checked ? 'bg-emerald-600' : 'bg-slate-800 border border-slate-700'
        )}
      >
        <div
          className={cn(
            'rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out',
            sizes[size].thumb,
            checked ? sizes[size].translate : 'translate-x-0'
          )}
        />
      </div>
      {label && <span className="text-xs font-medium text-slate-300">{label}</span>}
    </label>
  );
};
