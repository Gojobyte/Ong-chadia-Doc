import type { Request, Response, NextFunction } from 'express';
import type { Permission as PermissionType } from '@prisma/client';
import pkg from '@prisma/client';
const { Permission } = pkg;
import { UnauthorizedError, NotFoundError } from '../common/errors.js';
import * as permissionsService from '../modules/folders/permissions.service.js';

/**
 * Middleware factory to check folder access permissions
 * @param requiredPermission - Minimum permission level required (READ, WRITE, ADMIN)
 */
export function canAccessFolder(requiredPermission: PermissionType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const folderIdParam = req.params.id || req.params.folderId;
      const folderId = Array.isArray(folderIdParam) ? folderIdParam[0] : folderIdParam;
      if (!folderId) {
        throw new NotFoundError('ID de dossier manquant');
      }

      await permissionsService.checkFolderAccess(
        req.user.id,
        folderId,
        requiredPermission
      );

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Pre-configured middleware for common permission checks
export const requireRead = canAccessFolder(Permission.READ);
export const requireWrite = canAccessFolder(Permission.WRITE);
export const requireAdmin = canAccessFolder(Permission.ADMIN);
