# 11. Backend Architecture

## 11.1 Project Structure

```
apps/api/src/
├── index.ts                   # Entry point
├── app.ts                     # Express app setup
├── config/
│   ├── index.ts               # Config loader
│   ├── database.ts            # Prisma client
│   └── storage.ts             # Supabase storage
│
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.validators.ts
│   │
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.validators.ts
│   │
│   ├── folders/
│   │   ├── folders.routes.ts
│   │   ├── folders.controller.ts
│   │   ├── folders.service.ts
│   │   ├── folders.validators.ts
│   │   └── permissions.service.ts
│   │
│   ├── documents/
│   │   ├── documents.routes.ts
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── documents.validators.ts
│   │   ├── versions.service.ts
│   │   ├── share.service.ts
│   │   └── audit.service.ts
│   │
│   ├── projects/
│   │   ├── projects.routes.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── projects.validators.ts
│   │   ├── members.service.ts
│   │   └── project-documents.service.ts
│   │
│   └── dashboard/
│       ├── dashboard.routes.ts
│       ├── dashboard.controller.ts
│       └── dashboard.service.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   ├── validate.middleware.ts
│   ├── upload.middleware.ts
│   ├── rateLimiter.middleware.ts
│   └── errorHandler.middleware.ts
│
├── common/
│   ├── errors.ts
│   ├── responses.ts
│   ├── pagination.ts
│   └── logger.ts
│
└── utils/
    ├── jwt.ts
    ├── hash.ts
    └── storage.ts
```

## 11.2 Auth Middleware

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { prisma } from '@/config/database';
import { UnauthorizedError } from '@/common/errors';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

// middleware/rbac.middleware.ts
import { Role } from '@prisma/client';
import { ForbiddenError } from '@/common/errors';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

export const isSuperAdmin = authorize(Role.SUPER_ADMIN);
export const isStaffOrAbove = authorize(Role.SUPER_ADMIN, Role.STAFF);
```

## 11.3 Error Classes

```typescript
// common/errors.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code = 'BAD_REQUEST';
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}
```

---
