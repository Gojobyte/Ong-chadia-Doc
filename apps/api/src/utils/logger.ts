import { pino } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Structured logger using Pino
 * - Production: JSON format for log aggregation
 * - Development: Pretty printed for readability
 * - Test: Silent by default
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  enabled: !isTest,
  ...(isProduction
    ? {
        // Production: JSON logs for log aggregation (ELK, CloudWatch, etc.)
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        // Development: Pretty printed logs
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
});

/**
 * Create a child logger with context
 * @param context - Additional context to include in all logs
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Request logger middleware
 * Logs request details for debugging and monitoring
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const logData = {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    ...(userId && { userId }),
  };

  if (statusCode >= 500) {
    logger.error(logData, 'Request failed with server error');
  } else if (statusCode >= 400) {
    logger.warn(logData, 'Request failed with client error');
  } else {
    logger.info(logData, 'Request completed');
  }
}

export default logger;
