import React from 'react';
import { Badge } from './badge';
import { CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, Package } from 'lucide-react';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'delivered'
  | 'cancelled'
  | 'low_stock'
  | 'out_of_stock'
  | 'in_stock';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  className,
}) => {
  const normalizedStatus = status.toLowerCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'active':
      case 'completed':
      case 'delivered':
      case 'in_stock':
        return {
          variant: 'emerald' as const,
          icon: CheckCircle2,
          displayLabel: label || status.replace('_', ' '),
        };
      case 'pending':
      case 'processing':
        return {
          variant: 'amber' as const,
          icon: Clock,
          displayLabel: label || status.replace('_', ' '),
        };
      case 'low_stock':
        return {
          variant: 'amber' as const,
          icon: AlertTriangle,
          displayLabel: label || 'Low Stock',
        };
      case 'out_of_stock':
      case 'cancelled':
      case 'inactive':
        return {
          variant: 'rose' as const,
          icon: XCircle,
          displayLabel: label || status.replace('_', ' '),
        };
      default:
        return {
          variant: 'slate' as const,
          icon: Package,
          displayLabel: label || status,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon className="w-3 h-3 mr-1 shrink-0" />}
      <span className="capitalize">{config.displayLabel}</span>
    </Badge>
  );
};
