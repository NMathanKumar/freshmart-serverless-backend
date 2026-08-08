import type { ServiceError } from '../shared/types/service';

export type AppApiError = ServiceError;

export function parseApiError(error: unknown): AppApiError {
  // 1. Handle Native AbortError
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      code: 'REQUEST_ABORTED',
      message: 'Request was cancelled.',
      statusCode: 499,
      retryable: false
    };
  }

  // 2. Extract correlation ID and status
  let correlationId: string | undefined;
  let statusCode = 500;
  let message = 'An unexpected server error occurred.';
  let code = 'UNKNOWN_ERROR';
  
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;
    
    // Extract statusCode
    statusCode = errObj.status || errObj.response?.status || 500;

    // Extract correlationId
    correlationId = 
      errObj.headers?.['x-correlation-id'] ||
      errObj.headers?.['x-amzn-requestid'] ||
      errObj.response?.headers?.['x-correlation-id'] ||
      errObj.response?.headers?.['x-amzn-requestid'] ||
      errObj.correlationId;

    // Extract message
    message =
      errObj.message ||
      errObj.response?.data?.message ||
      errObj.data?.message ||
      message;

    // Extract code
    code = errObj.code || errObj.response?.data?.code || `HTTP_${statusCode}`;
  } else if (typeof error === 'string') {
    message = error;
  }

  // 3. Network Failure Matrix & Retryable Logic
  let retryable = false;
  
  // Axios Network Error or Timeout
  if (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || statusCode === 0) {
    message = code === 'ECONNABORTED' ? 'Request timed out.' : 'Network offline. Please check your connection.';
    code = code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK_OFFLINE';
    retryable = true; // Safe to retry network failures
  } else {
    // Map HTTP status codes to standard messages and retry policies
    switch (statusCode) {
      case 400:
        message = message !== 'An unexpected server error occurred.' ? message : 'Validation failed. Please check your input.';
        retryable = false;
        break;
      case 401:
        message = 'Your session has expired. Please sign in again.';
        retryable = false; // Requires user action
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        retryable = false;
        break;
      case 404:
        message = 'The requested resource was not found.';
        retryable = false;
        break;
      case 409:
        message = 'A conflict occurred. Please refresh and try again.';
        retryable = false;
        break;
      case 429:
        message = 'You are making too many requests. Please slow down.';
        retryable = true; // Can retry after delay
        break;
      case 500:
        message = 'An internal server error occurred.';
        retryable = true; // Server might recover
        break;
      case 502:
      case 503:
      case 504:
        message = 'The service is temporarily unavailable. Please try again later.';
        retryable = true; // Gateway/upstream issues are usually transient
        break;
    }
  }

  return {
    code,
    message,
    statusCode,
    retryable,
    correlationId
  };
}
