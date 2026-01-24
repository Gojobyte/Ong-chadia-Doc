import type { Request, Response, NextFunction } from 'express';
import * as sharingService from './sharing.service.js';
import * as accessLogsService from './access-logs.service.js';
import * as storageService from './storage.service.js';
import { createShareLinkSchema } from '@ong-chadia/shared';

/**
 * Create a share link for a document
 * POST /api/documents/:id/share
 */
export async function createShareLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const userId = req.user!.id;

    // Validate request body
    const validated = createShareLinkSchema.parse(req.body);

    const shareLink = await sharingService.createShareLink(
      documentId,
      validated.expiresIn,
      validated.maxAccessCount ?? null,
      userId
    );

    res.status(201).json(shareLink);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all active share links for a document
 * GET /api/documents/:id/share-links
 */
export async function getShareLinks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;

    const shareLinks = await sharingService.getShareLinks(documentId);

    res.json({ data: shareLinks });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke a share link
 * DELETE /api/documents/:id/share/:linkId
 */
export async function revokeShareLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const linkId = req.params.linkId as string;
    const userId = req.user!.id;

    await sharingService.revokeShareLink(documentId, linkId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Download document via share token (public route, no auth required)
 * GET /api/share/:token
 */
export async function downloadByShareToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.params.token as string;

    const { document, shareLink } = await sharingService.getDocumentByShareToken(token);

    // Log the access
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = req.ip || (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || null;
    await accessLogsService.logAccess(
      document.id,
      null, // No user ID for public access
      'SHARE_DOWNLOAD',
      ipAddress,
      { shareToken: shareLink.token.slice(-8) } // Store only last 8 chars
    );

    // Get signed URL and redirect
    const signedUrl = await storageService.getSignedUrl(document.storagePath, 300);
    res.redirect(signedUrl);
  } catch (error) {
    next(error);
  }
}

/**
 * Get access logs for a document (Super-Admin only)
 * GET /api/documents/:id/access-logs
 */
export async function getAccessLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;

    const result = await accessLogsService.getAccessLogs(documentId, page, pageSize);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
