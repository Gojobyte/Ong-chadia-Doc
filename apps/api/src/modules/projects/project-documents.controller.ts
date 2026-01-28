import type { Request, Response, NextFunction } from 'express';
import * as projectDocumentsService from './project-documents.service.js';

/**
 * GET /api/projects/:id/documents
 * Get all documents linked to a project
 */
export async function getLinkedDocuments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await projectDocumentsService.getLinkedDocuments(projectId, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/projects/:id/documents
 * Link a document to a project
 */
export async function linkDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.id;
    const { documentId } = req.body;

    const link = await projectDocumentsService.linkDocument(projectId, documentId, userId);
    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/projects/:id/documents/folder/:folderId
 * Link all documents from a folder to a project
 */
export async function linkFolder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const folderId = req.params.folderId as string;
    const userId = req.user!.id;
    const recursive = req.body.recursive === true;

    const result = await projectDocumentsService.linkFolder(projectId, folderId, userId, recursive);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/projects/:id/documents/:docId
 * Unlink a document from a project
 */
export async function unlinkDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const documentId = req.params.docId as string;

    await projectDocumentsService.unlinkDocument(projectId, documentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
