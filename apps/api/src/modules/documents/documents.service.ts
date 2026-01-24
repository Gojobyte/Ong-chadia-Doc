import { fileTypeFromBuffer } from 'file-type';
import { prisma } from '../../config/database.js';
import {
  NotFoundError,
  FileTooLargeError,
  UnsupportedFileTypeError,
} from '../../common/errors.js';
import * as storageService from './storage.service.js';

// File constants
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// Types
export interface DocumentResponse {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string;
  uploadedById: string;
  createdAt: string;
  url?: string;
}

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Validate MIME type by checking file magic bytes
 */
async function validateMimeType(
  buffer: Buffer,
  declaredMime: string
): Promise<boolean> {
  // Check if declared MIME is allowed
  if (!ALLOWED_MIME_TYPES.includes(declaredMime as typeof ALLOWED_MIME_TYPES[number])) {
    return false;
  }

  // Detect actual MIME type from buffer
  const detected = await fileTypeFromBuffer(buffer);

  // For text files, file-type returns undefined
  if (!detected && declaredMime === 'text/plain') {
    return true;
  }

  // For other files, verify detected matches declared
  return detected?.mime === declaredMime;
}

/**
 * Upload a document to a folder
 */
export async function uploadDocument(
  file: UploadedFile,
  folderId: string,
  userId: string
): Promise<DocumentResponse> {
  // Verify folder exists
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileTooLargeError(MAX_FILE_SIZE);
  }

  // Validate MIME type
  const isValidMime = await validateMimeType(file.buffer, file.mimetype);
  if (!isValidMime) {
    throw new UnsupportedFileTypeError(file.mimetype);
  }

  // Generate storage path and upload
  const storagePath = storageService.generateStoragePath(folderId, file.originalname);
  await storageService.uploadFile(file.buffer, storagePath, file.mimetype);

  // Save document metadata to database
  const document = await prisma.document.create({
    data: {
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath,
      folderId,
      uploadedById: userId,
    },
  });

  // Get signed URL for response
  const url = await storageService.getSignedUrl(storagePath);

  return mapDocumentToResponse(document, url);
}

/**
 * Get a document by ID with signed URL
 */
export async function getDocumentById(id: string): Promise<DocumentResponse> {
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const url = await storageService.getSignedUrl(document.storagePath);
  return mapDocumentToResponse(document, url);
}

/**
 * Get documents in a folder
 */
export async function getDocumentsByFolder(
  folderId: string,
  page = 1,
  limit = 50
): Promise<{
  data: DocumentResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  // Verify folder exists
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: { folderId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.document.count({ where: { folderId } }),
  ]);

  // Get signed URLs for all documents
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const url = await storageService.getSignedUrl(doc.storagePath);
      return mapDocumentToResponse(doc, url);
    })
  );

  return {
    data: documentsWithUrls,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  // Delete from storage
  await storageService.deleteFile(document.storagePath);

  // Delete from database
  await prisma.document.delete({ where: { id } });
}

/**
 * Map Prisma document to response format
 */
function mapDocumentToResponse(
  document: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    folderId: string;
    uploadedById: string;
    createdAt: Date;
  },
  url?: string
): DocumentResponse {
  return {
    id: document.id,
    name: document.name,
    mimeType: document.mimeType,
    size: document.size,
    folderId: document.folderId,
    uploadedById: document.uploadedById,
    createdAt: document.createdAt.toISOString(),
    url,
  };
}
