import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../common/errors.js';
import * as storageService from './storage.service.js';

// Types defined locally to avoid import issues
interface DocumentVersionResponse {
  id: string;
  documentId: string;
  versionNumber: number;
  size: number;
  uploadedById: string;
  createdAt: string;
  url?: string;
  isCurrent: boolean;
}

interface VersionListResponse {
  documentId: string;
  documentName: string;
  currentVersionId: string | null;
  versions: DocumentVersionResponse[];
}

/**
 * Get the next version number for a document
 */
async function getNextVersionNumber(documentId: string): Promise<number> {
  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: { versionNumber: 'desc' },
  });
  return (lastVersion?.versionNumber ?? 0) + 1;
}

/**
 * Upload a new version of a document
 */
export async function uploadNewVersion(
  documentId: string,
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  userId: string
): Promise<DocumentVersionResponse> {
  // Get document
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  // Get next version number
  const versionNumber = await getNextVersionNumber(documentId);

  // Generate storage path with version suffix
  const storagePath = storageService.generateStoragePath(
    document.folderId,
    `v${versionNumber}_${file.originalname}`
  );

  // Upload file to storage
  await storageService.uploadFile(file.buffer, storagePath, file.mimetype);

  // Create version record
  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber,
      storagePath,
      size: file.size,
      uploadedById: userId,
    },
  });

  // Update document with new current version
  await prisma.document.update({
    where: { id: documentId },
    data: {
      currentVersionId: version.id,
      size: file.size,
    },
  });

  const url = await storageService.getSignedUrl(storagePath);

  return mapVersionToResponse(version, url, true);
}

/**
 * Get all versions of a document
 */
export async function getVersions(documentId: string): Promise<VersionListResponse> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        include: { uploadedBy: true },
      },
    },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const versionsWithUrls = await Promise.all(
    document.versions.map(async (v) => {
      const url = await storageService.getSignedUrl(v.storagePath);
      return mapVersionToResponse(v, url, v.id === document.currentVersionId);
    })
  );

  return {
    documentId: document.id,
    documentName: document.name,
    currentVersionId: document.currentVersionId,
    versions: versionsWithUrls,
  };
}

/**
 * Get download URL for a specific version
 */
export async function getVersionDownloadUrl(
  documentId: string,
  versionId: string
): Promise<{ url: string; expiresIn: number }> {
  const version = await prisma.documentVersion.findFirst({
    where: { id: versionId, documentId },
  });

  if (!version) {
    throw new NotFoundError('Version non trouvée');
  }

  const expiresIn = 3600; // 1 hour
  const url = await storageService.getSignedUrl(version.storagePath, expiresIn);

  return { url, expiresIn };
}

/**
 * Restore an older version as the current version
 */
export async function restoreVersion(
  documentId: string,
  versionId: string
): Promise<DocumentVersionResponse> {
  const version = await prisma.documentVersion.findFirst({
    where: { id: versionId, documentId },
  });

  if (!version) {
    throw new NotFoundError('Version non trouvée');
  }

  // Update document with restored version
  await prisma.document.update({
    where: { id: documentId },
    data: {
      currentVersionId: versionId,
      size: version.size,
    },
  });

  const url = await storageService.getSignedUrl(version.storagePath);

  return mapVersionToResponse(version, url, true);
}

/**
 * Get the folder ID of a document (for permission checks)
 */
export async function getDocumentFolderId(documentId: string): Promise<string | null> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { folderId: true },
  });
  return document?.folderId ?? null;
}

/**
 * Map Prisma version to response format
 */
function mapVersionToResponse(
  version: {
    id: string;
    documentId: string;
    versionNumber: number;
    size: number;
    uploadedById: string;
    createdAt: Date;
  },
  url?: string,
  isCurrent: boolean = false
): DocumentVersionResponse {
  return {
    id: version.id,
    documentId: version.documentId,
    versionNumber: version.versionNumber,
    size: version.size,
    uploadedById: version.uploadedById,
    createdAt: version.createdAt.toISOString(),
    url,
    isCurrent,
  };
}
