# API Middleware Documentation

## Available Middlewares

### 1. Authentication Middleware (`auth.middleware.ts`)

Verifies JWT access tokens and loads user information from the database.

#### `authenticate`

Authenticates requests using JWT Bearer tokens.

**Usage:**
```typescript
import { authenticate } from '@/middleware/auth.middleware.js';

// Single route
router.get('/profile', authenticate, controller.getProfile);

// All routes in router
router.use(authenticate);
```

**Behavior:**
- Extracts token from `Authorization: Bearer {token}` header
- Verifies token signature and expiration
- Loads user from database and verifies they are active
- Attaches user object to `req.user`

**Errors:**
| Status | Message | Cause |
|--------|---------|-------|
| 401 | No token provided | Missing or malformed Authorization header |
| 401 | Invalid or expired token | Token verification failed |
| 401 | User not found | User ID in token doesn't exist |
| 401 | Account is inactive | User's `isActive` is false |

---

### 2. RBAC Middleware (`rbac.middleware.ts`)

Role-Based Access Control for restricting routes by user role.

#### `authorize(...roles: Role[])`

Factory function that creates middleware allowing only specified roles.

**Usage:**
```typescript
import { authorize } from '@/middleware/rbac.middleware.js';
import { Role } from '@prisma/client';

// Allow only SUPER_ADMIN
router.delete('/users/:id', authenticate, authorize(Role.SUPER_ADMIN), controller.delete);

// Allow multiple roles
router.get('/reports', authenticate, authorize(Role.SUPER_ADMIN, Role.STAFF), controller.reports);
```

**Errors:**
| Status | Message | Cause |
|--------|---------|-------|
| 401 | Authentication required | `req.user` not set (authenticate not called) |
| 403 | Insufficient permissions | User's role not in allowed list |

---

### 3. Predefined Guards (`rbac.middleware.ts`)

Ready-to-use guards for common role requirements.

| Guard | Allowed Roles | Use Case |
|-------|--------------|----------|
| `isSuperAdmin` | SUPER_ADMIN | User management, system config |
| `isStaffOrAbove` | SUPER_ADMIN, STAFF | Content management, reports |
| `isContributorOrAbove` | SUPER_ADMIN, STAFF, CONTRIBUTOR | Document upload, content creation |

**Usage:**
```typescript
import { authenticate } from '@/middleware/auth.middleware.js';
import { isSuperAdmin, isStaffOrAbove, isContributorOrAbove } from '@/middleware/rbac.middleware.js';

// Super Admin only
router.get('/admin/users', authenticate, isSuperAdmin, usersController.list);

// Staff or higher
router.get('/admin/reports', authenticate, isStaffOrAbove, reportsController.list);

// Contributors or higher
router.post('/documents', authenticate, isContributorOrAbove, documentsController.upload);
```

---

### 4. Validation Middleware (`validate.middleware.ts`)

Validates request data using Zod schemas.

#### `validate(schema: ZodSchema)`

Validates `req.body` against provided schema.

**Usage:**
```typescript
import { validate } from '@/middleware/validate.middleware.js';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

router.post('/users', validate(createUserSchema), controller.create);
```

#### `validateQuery(schema: ZodSchema)`

Validates `req.query` parameters.

**Usage:**
```typescript
import { validateQuery } from '@/middleware/validate.middleware.js';

const paginationSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

router.get('/users', validateQuery(paginationSchema), controller.list);
```

#### `validateParams(schema: ZodSchema)`

Validates `req.params` route parameters.

**Usage:**
```typescript
import { validateParams } from '@/middleware/validate.middleware.js';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

router.get('/users/:id', validateParams(idParamSchema), controller.getById);
```

**Errors:**
| Status | Message | Cause |
|--------|---------|-------|
| 400 | Validation error details | Schema validation failed |

---

## Complete Route Example

```typescript
import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware.js';
import { isSuperAdmin } from '@/middleware/rbac.middleware.js';
import { validate, validateParams } from '@/middleware/validate.middleware.js';
import { usersController } from './users.controller.js';
import { createUserSchema, updateUserSchema, idParamSchema } from './users.validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// All routes require SUPER_ADMIN role
router.use(isSuperAdmin);

// Routes
router.get('/', usersController.list);
router.get('/:id', validateParams(idParamSchema), usersController.getById);
router.post('/', validate(createUserSchema), usersController.create);
router.patch('/:id', validateParams(idParamSchema), validate(updateUserSchema), usersController.update);
router.delete('/:id', validateParams(idParamSchema), usersController.delete);

export default router;
```

---

## User Object in Request

After successful authentication, `req.user` contains:

```typescript
interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'STAFF' | 'CONTRIBUTOR' | 'GUEST';
  isActive: boolean;
}
```

**Usage in controllers:**
```typescript
async function getProfile(req: Request, res: Response) {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  // ...
}
```
