import type { Request, Response, NextFunction } from 'express';
import * as searchService from './search.service.js';

/**
 * GET /api/documents/search - Search documents
 */
export async function searchDocuments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = {
      q: req.query.q as string | undefined,
      type: req.query.type as string | undefined,
      folderId: req.query.folderId as string | undefined,
      recursive: req.query.recursive === 'true',
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 50, 100),
    };

    const results = await searchService.searchDocuments(params, req.user!.role);

    res.json(results);
  } catch (error) {
    next(error);
  }
}
