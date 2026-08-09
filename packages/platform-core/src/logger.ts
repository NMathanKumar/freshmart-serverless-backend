export interface LoggerContext {
  service: string;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  operation?: string;
}

export interface Logger {
  debug(message: string, extra?: Record<string, unknown>): void;
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
}

const emit = (level: string, context: LoggerContext, message: string, extra?: Record<string, unknown>) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    requestId: context.requestId,
    correlationId: context.correlationId,
    userId: context.userId,
    service: context.service,
    operation: context.operation,
    duration: extra?.duration,
    status: extra?.status,
    errorCode: extra?.errorCode,
    error: extra?.error,
    details: extra?.details
  };
  
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );
  console.log(JSON.stringify(cleanPayload));
};

export const createLogger = (context: LoggerContext): Logger => ({
  debug(message, extra) { emit('DEBUG', context, message, extra); },
  info(message, extra) { emit('INFO', context, message, extra); },
  warn(message, extra) { emit('WARN', context, message, extra); },
  error(message, extra) { emit('ERROR', context, message, extra); }
});
