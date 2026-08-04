import React from 'react';
import { cn } from '../../lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex items-start p-3 rounded-xl border transition-all cursor-pointer select-none',
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 text-slate-100'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/40 text-slate-300',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-900"
              />
              <div className="ml-3">
                <span className="text-xs font-medium block">{option.label}</span>
                {option.description && (
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-[11px] font-medium text-rose-400">{error}</p>}
    </div>
  );
};
