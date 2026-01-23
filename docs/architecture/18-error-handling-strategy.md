# 18. Error Handling Strategy

## 18.1 Error Response Format

```typescript
interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId: string;
  };
}

type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';
```

## 18.2 Error Handler Middleware

```typescript
// middleware/errorHandler.middleware.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const requestId = uuid();

  logger.error({ requestId, error: err.message, stack: err.stack });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
}
```

---
