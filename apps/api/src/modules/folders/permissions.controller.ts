import type { Request, Response, NextFunction } from 'express';
import * as permissionsService from './permissions.service.js';

/**
 * GET /api/folders/:id/permissions - Get folder permissions
 */
export async function getFolderPermissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const folderId = req.params.id as string;
    const permissions = await permissionsService.getFolderPermissions(folderId);
    res.json({ data: permissions });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/folders/:id/permissions - Add permission to folder
 */
export async function addPermission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const folderId = req.params.id as string;
    const permission = await permissionsService.addPermission(folderId, req.body);
    res.status(201).json({ data: permission });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/folders/:id/permissions/:permId - Remove permission
 */
export async function removePermission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const permId = req.params.permId as string;
    await permissionsService.removePermission(permId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
