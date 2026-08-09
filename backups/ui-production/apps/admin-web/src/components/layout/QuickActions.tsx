import React from 'react';
import { DropdownMenu, type DropdownMenuItem } from '../ui/dropdown-menu';
import { Plus, Package, Tag, Warehouse, FileText } from 'lucide-react';
import { Button } from '../ui/button';

export interface QuickActionsProps {
  onNavigate?: (path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions: DropdownMenuItem[] = [
    {
      id: 'add-product',
      label: 'Add New Product',
      icon: <Package className="w-4 h-4 text-emerald-400" />,
      onClick: () => onNavigate?.('/products'),
    },
    {
      id: 'add-category',
      label: 'Add Category',
      icon: <Tag className="w-4 h-4 text-teal-400" />,
      onClick: () => onNavigate?.('/categories'),
    },
    {
      id: 'adjust-stock',
      label: 'Stock Adjustment',
      icon: <Warehouse className="w-4 h-4 text-amber-400" />,
      onClick: () => onNavigate?.('/inventory'),
    },
    {
      id: 'generate-report',
      label: 'Generate Sales Report',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      onClick: () => onNavigate?.('/reports'),
    },
  ];

  return (
    <DropdownMenu
      align="right"
      items={actions}
      trigger={
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Quick Action
        </Button>
      }
    />
  );
};
