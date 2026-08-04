import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options array
  const formattedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-[#e9f2e7] hover:border-[#04883b] text-xs font-semibold text-[#0f172a] shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20"
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#04883b]">{icon}</span>}
          <span className="truncate">{selectedOption.label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#04883b]' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 left-0 mt-2 z-50 bg-white rounded-2xl border border-[#e9f2e7] shadow-xl py-1.5 max-h-60 overflow-y-auto animate-fadeIn backdrop-blur-md">
          {formattedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#e6f7ec] text-[#04883b]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#0f172a]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#04883b] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
