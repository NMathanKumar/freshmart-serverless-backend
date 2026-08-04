export interface AppApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export function parseApiError(error: unknown): AppApiError {
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;
    const status = errObj.status || errObj.response?.status || 500;
    const message =
      errObj.message ||
      errObj.response?.data?.message ||
      errObj.data?.message ||
      'An unexpected server error occurred.';
    const code = errObj.code || errObj.response?.data?.code || `HTTP_${status}`;

    return {
      status,
      message,
      code,
      details: errObj.response?.data?.details || errObj.data || {},
    };
  }

  return {
    status: 500,
    message: typeof error === 'string' ? error : 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
  };
}
