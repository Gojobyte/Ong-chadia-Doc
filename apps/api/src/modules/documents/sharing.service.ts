import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import {
  ExpirationDuration,
  EXPIRATION_MS,
  ShareLinkResponse,
} from '@ong-chadia/shared';
import * as accessLogsService from './access-logs.service.js';

/**
 * Generate a secure random token for share links
 */
function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date from duration
 */
function calculateExpiresAt(duration: ExpirationDuration): Date {
  return new Date(Date.now() + EXPIRATION_MS[duration]);
}

/**
 * Create a share link for a document
 */
export async function createShareLink(
  documentId: string,
  expiresIn: ExpirationDuration,
  maxAccessCount: number | null,
  userId: string
): Promise<ShareLinkResponse> {
  // Verify document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const token = generateShareToken();
  const expiresAt = calculateExpiresAt(expiresIn);

  const shareLink = await prisma.shareLink.create({
    data: {
      documentId,
      token,
      expiresAt,
      maxAccessCount,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  // Log the share action
  await accessLogsService.logAccess(documentId, userId, 'SHARE', null);

  return mapShareLinkToResponse(shareLink);
}

/**
 * Get a document by share token, validating expiration, revocation and access limits
 */
export async function getDocumentByShareToken(token: string) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: { document: true },
  });

  if (!shareLink) {
    throw new NotFoundError('Lien de partage non trouvé');
  }

  // Check if revoked
  if (shareLink.revokedAt) {
    throw new ForbiddenError('Ce lien de partage a été révoqué');
  }

  // Check if expired
  if (new Date() > shareLink.expiresAt) {
    throw new ForbiddenError('Ce lien de partage a expiré');
  }

  // Check max access count
  if (
    shareLink.maxAccessCount !== null &&
    shareLink.accessCount >= shareLink.maxAccessCount
  ) {
    throw new ForbiddenError('Le nombre maximum d\'accès a été atteint');
  }

  // Increment access count
  await prisma.shareLink.update({
    where: { id: shareLink.id },
    data: { accessCount: { increment: 1 } },
  });

  return {
    document: shareLink.document,
    shareLink,
  };
}

/**
 * Revoke a share link
 */
export async function revokeShareLink(
  documentId: string,
  linkId: string,
  userId: string
): Promise<void> {
  const shareLink = await prisma.shareLink.findUnique({
    where: { id: linkId },
  });

  if (!shareLink) {
    throw new NotFoundError('Lien de partage non trouvé');
  }

  // Verify the link belongs to the document
  if (shareLink.documentId !== documentId) {
    throw new NotFoundError('Lien de partage non trouvé');
  }

  // Update revoked timestamp
  await prisma.shareLink.update({
    where: { id: linkId },
    data: { revokedAt: new Date() },
  });

  // Log the revocation
  await accessLogsService.logAccess(documentId, userId, 'SHARE_REVOKE', null);
}

/**
 * Get all active share links for a document
 */
export async function getShareLinks(documentId: string): Promise<ShareLinkResponse[]> {
  // Verify document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const shareLinks = await prisma.shareLink.findMany({
    where: {
      documentId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return shareLinks.map(mapShareLinkToResponse);
}

/**
 * Map Prisma ShareLink to response format
 */
function mapShareLinkToResponse(shareLink: {
  id: string;
  documentId: string;
  token: string;
  expiresAt: Date;
  maxAccessCount: number | null;
  accessCount: number;
  revokedAt: Date | null;
  createdAt: Date;
  createdBy: { firstName: string; lastName: string };
}): ShareLinkResponse {
  return {
    id: shareLink.id,
    documentId: shareLink.documentId,
    token: shareLink.token,
    expiresAt: shareLink.expiresAt.toISOString(),
    maxAccessCount: shareLink.maxAccessCount,
    accessCount: shareLink.accessCount,
    revokedAt: shareLink.revokedAt?.toISOString() ?? null,
    createdAt: shareLink.createdAt.toISOString(),
    createdBy: shareLink.createdBy,
  };
}
