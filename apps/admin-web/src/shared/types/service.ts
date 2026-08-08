export interface ServiceError {
  code: string;
  message: string;
  statusCode?: number;
  retryable: boolean;
  correlationId?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
  success: boolean;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    cursor?: string;
  };
}
