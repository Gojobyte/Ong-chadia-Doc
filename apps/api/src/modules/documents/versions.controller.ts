import type { Request, Response, NextFunction } from 'express';
import * as versionsService from './versions.service.js';

/**
 * POST /api/documents/:id/versions - Upload a new version
 */
export async function uploadNewVersion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Aucun fichier fourni',
        },
      });
      return;
    }

    const version = await versionsService.uploadNewVersion(
      documentId,
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      req.user!.id
    );

    res.status(201).json({ data: version });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id/versions - Get all versions
 */
export async function getVersions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const result = await versionsService.getVersions(documentId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id/versions/:versionId/download - Get download URL for a version
 */
export async function getVersionDownloadUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const versionId = req.params.versionId as string;
    const result = await versionsService.getVersionDownloadUrl(documentId, versionId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/documents/:id/versions/:versionId/restore - Restore a version
 */
export async function restoreVersion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const versionId = req.params.versionId as string;
    const version = await versionsService.restoreVersion(documentId, versionId);
    res.json({ data: version });
  } catch (error) {
    next(error);
  }
}
