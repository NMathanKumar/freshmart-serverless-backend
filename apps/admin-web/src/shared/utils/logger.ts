export interface LogContext {
  module?: string;
  operation?: string;
  correlationId?: string;
  [key: string]: any;
}

/**
 * Standardized Logger Utility to replace raw console.log.
 * Formats logs consistently for CloudWatch/Datadog ingestion.
 */
export const Logger = {
  info: (message: string, context?: LogContext) => {
    const payload = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };
    console.info(JSON.stringify(payload));
  },
  warn: (message: string, context?: LogContext) => {
    const payload = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };
    console.warn(JSON.stringify(payload));
  },
  error: (message: string, error?: any, context?: LogContext) => {
    const payload = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
      ...context
    };
    console.error(JSON.stringify(payload));
  },
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      const payload = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...context
      };
      console.debug(JSON.stringify(payload));
    }
  },
};
