import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select } from './select';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-slate-800/80 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        {totalItems !== undefined && (
          <span>
            Showing <strong className="text-slate-200">{startItem}</strong> to{' '}
            <strong className="text-slate-200">{endItem}</strong> of{' '}
            <strong className="text-slate-200">{totalItems}</strong> entries
          </span>
        )}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <Select
              options={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: String(opt),
              }))}
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              className="py-1 px-2 text-xs w-20"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 h-8 w-8"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="px-3 py-1 font-semibold text-slate-200 bg-slate-800 rounded-lg">
          Page {currentPage} of {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 h-8 w-8"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
