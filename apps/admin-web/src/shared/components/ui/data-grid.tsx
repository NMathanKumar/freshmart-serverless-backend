import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from './card';

export interface DataGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
}

export function DataGrid<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No items found',
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}: DataGridProps<T>) {
  const gridClasses = `grid grid-cols-1 sm:grid-cols-${columns.sm || 1} md:grid-cols-${columns.md || 2} lg:grid-cols-${columns.lg || 3} xl:grid-cols-${columns.xl || 4} gap-4`;

  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx} className="p-5 h-44 animate-pulse">
            <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4" />
            <div className="h-4 bg-slate-800/80 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-16 text-center text-slate-400 glass-card rounded-2xl">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {data.map((item) => (
        <React.Fragment key={keyExtractor(item)}>{renderItem(item)}</React.Fragment>
      ))}
    </div>
  );
}
