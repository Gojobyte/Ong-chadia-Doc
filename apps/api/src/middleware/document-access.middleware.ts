import type { Request, Response, NextFunction } from 'express';
import { Permission } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../common/errors.js';
import { getEffectivePermission } from '../modules/folders/permissions.service.js';

/**
 * Middleware to check if user has permission to access a document
 * Checks the permission on the document's parent folder
 */
export function canAccessDocument(requiredPermission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = req.params.id as string;
      const userRole = req.user!.role;

      // Get the document with its folder
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { folderId: true },
      });

      if (!document) {
        throw new NotFoundError('Document non trouvé');
      }

      // Get user's effective permission on the folder based on their role
      const effective = await getEffectivePermission(document.folderId, userRole);

      if (!effective.permission) {
        throw new ForbiddenError('Accès au document refusé');
      }

      // Check permission hierarchy: ADMIN > WRITE > READ
      const permissionLevel: Record<Permission, number> = {
        [Permission.READ]: 1,
        [Permission.WRITE]: 2,
        [Permission.ADMIN]: 3,
      };
      const requiredLevel = permissionLevel[requiredPermission];
      const userLevel = permissionLevel[effective.permission];

      if (userLevel < requiredLevel) {
        throw new ForbiddenError('Permission insuffisante pour cette opération');
      }

      // Store the document's folder ID for potential use in the handler
      req.documentFolderId = document.folderId;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user can move a document
 * Requires WRITE permission on both source and destination folders
 */
export function canMoveDocument() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = req.params.id as string;
      const destinationFolderId = req.body.folderId;
      const userRole = req.user!.role;

      // If no destination folder, skip this middleware (it's just a rename)
      if (!destinationFolderId) {
        return next();
      }

      // Get the document with its current folder
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { folderId: true },
      });

      if (!document) {
        throw new NotFoundError('Document non trouvé');
      }

      // If not actually moving, skip the check
      if (document.folderId === destinationFolderId) {
        return next();
      }

      // Check WRITE permission on source folder
      const sourceEffective = await getEffectivePermission(document.folderId, userRole);

      if (!sourceEffective.permission || sourceEffective.permission === Permission.READ) {
        throw new ForbiddenError('Permission WRITE requise sur le dossier source');
      }

      // Check destination folder exists
      const destinationFolder = await prisma.folder.findUnique({
        where: { id: destinationFolderId },
      });

      if (!destinationFolder) {
        throw new NotFoundError('Dossier de destination non trouvé');
      }

      // Check WRITE permission on destination folder
      const destEffective = await getEffectivePermission(destinationFolderId, userRole);

      if (!destEffective.permission || destEffective.permission === Permission.READ) {
        throw new ForbiddenError('Permission WRITE requise sur le dossier de destination');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Type extension is handled in types/express/index.d.ts
