import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';

export interface ChartWrapperProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number | string;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  action,
  children,
  isLoading = false,
  isEmpty = false,
  height = 300,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div style={{ height }}>
            <LoadingState label="Loading chart data..." />
          </div>
        ) : isEmpty ? (
          <div style={{ height }}>
            <EmptyState title="No chart data" description="Analytics metrics will populate as orders process." />
          </div>
        ) : (
          <div style={{ height, width: '100%' }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
};
