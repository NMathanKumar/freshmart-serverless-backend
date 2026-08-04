import React from 'react';
import { Select, type SelectOption } from './select';
import { Button } from './button';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  options: SelectOption[];
  value: string;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onReset?: () => void;
  children?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  children,
}) => {
  const hasActiveFilter = filters.some((f) => f.value !== '');

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Filter className="w-4 h-4 text-emerald-400" />
        <span>Filters:</span>
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          placeholder={`All ${filter.label}`}
          options={filter.options}
          value={filter.value}
          onChange={(val) => onFilterChange(filter.key, val)}
          className="py-1.5 px-3 text-xs w-40"
        />
      ))}

      {children}

      {hasActiveFilter && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset
        </Button>
      )}
    </div>
  );
};
