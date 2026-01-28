import type { Request, Response, NextFunction } from 'express';
import * as commentsService from './comments.service.js';

/**
 * GET /api/documents/:id/comments
 * Get all comments for a document
 */
export async function getComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const result = await commentsService.getComments(documentId, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/documents/:id/comments
 * Create a comment on a document
 */
export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const userId = req.user!.id;
    const { content } = req.body;

    const comment = await commentsService.createComment(documentId, userId, content);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/documents/:id/comments/:commentId
 * Update a comment
 */
export async function updateComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const commentId = req.params.commentId as string;
    const userId = req.user!.id;
    const { content } = req.body;

    const comment = await commentsService.updateComment(commentId, userId, content);
    res.json(comment);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/documents/:id/comments/:commentId
 * Delete a comment
 */
export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const commentId = req.params.commentId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    await commentsService.deleteComment(commentId, userId, userRole);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
