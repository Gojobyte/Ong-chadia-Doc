import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Log unexpected errors with full details
  console.error('=== UNEXPECTED ERROR ===');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('========================');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
