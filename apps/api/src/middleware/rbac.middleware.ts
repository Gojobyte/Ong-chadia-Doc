import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Checks if the authenticated user has one of the allowed roles
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

// Predefined guards for common role checks

/**
 * Guard: Only SUPER_ADMIN can access
 * Use for: User management, system configuration, sensitive operations
 */
export const isSuperAdmin = authorize(Role.SUPER_ADMIN);

/**
 * Guard: SUPER_ADMIN or STAFF can access
 * Use for: Content management, reports, administrative functions
 */
export const isStaffOrAbove = authorize(Role.SUPER_ADMIN, Role.STAFF);

/**
 * Guard: SUPER_ADMIN, STAFF, or CONTRIBUTOR can access
 * Use for: Document upload, content creation
 */
export const isContributorOrAbove = authorize(Role.SUPER_ADMIN, Role.STAFF, Role.CONTRIBUTOR);
