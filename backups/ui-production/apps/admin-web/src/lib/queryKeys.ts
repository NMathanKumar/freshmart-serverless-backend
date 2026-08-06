export const queryKeys = {
  activity: {
    all: ['activity'] as const,
    list: (filters: Record<string, any>) => ['activity', 'list', filters] as const,
    detail: (id: string) => ['activity', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, any>) => ['notifications', 'list', filters] as const,
  },
  analytics: {
    dashboard: (dateRange?: string) => ['analytics', 'dashboard', dateRange] as const,
  },
  delivery: {
    all: ['delivery'] as const,
    list: (filters?: Record<string, any>) => ['delivery', 'list', filters] as const,
    detail: (id: string) => ['delivery', 'detail', id] as const,
  },
};
