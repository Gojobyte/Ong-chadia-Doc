import type { Request, Response, NextFunction } from 'express';
import * as documentsService from './documents.service.js';

/**
 * POST /api/documents/upload - Upload a document
 */
export async function uploadDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    const { folderId } = req.body;

    if (!file) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Aucun fichier fourni',
        },
      });
      return;
    }

    const document = await documentsService.uploadDocument(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      folderId,
      req.user!.id
    );

    res.status(201).json({ data: document });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id - Get a document by ID
 */
export async function getDocumentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const document = await documentsService.getDocumentById(id);
    res.json({ data: document });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/folders/:id/documents - Get documents in a folder
 */
export async function getDocumentsByFolder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const folderId = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const result = await documentsService.getDocumentsByFolder(folderId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/documents/:id - Delete a document
 */
export async function deleteDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    await documentsService.deleteDocument(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
