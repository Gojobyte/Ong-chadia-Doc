import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../common/errors.js';

/**
 * Validation middleware factory using Zod schemas
 * Validates req.body against the provided schema
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError;
      const messages = error.issues.map(e => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      });
      return next(new BadRequestError(messages.join(', ')));
    }

    next();
  };
}

/**
 * Validation middleware for query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const error = result.error as ZodError;
      const messages = error.issues.map(e => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      });
      return next(new BadRequestError(messages.join(', ')));
    }

    next();
  };
}

/**
 * Validation middleware for route parameters
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const error = result.error as ZodError;
      const messages = error.issues.map(e => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      });
      return next(new BadRequestError(messages.join(', ')));
    }

    next();
  };
}
