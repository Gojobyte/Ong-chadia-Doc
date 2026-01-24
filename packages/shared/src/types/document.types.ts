/**
 * Document response format
 */
export interface DocumentResponse {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string;
  uploadedById: string;
  createdAt: string;
  url?: string; // Signed URL (temporary)
}

/**
 * Upload document DTO
 */
export interface UploadDocumentDto {
  folderId: string;
}

/**
 * Allowed MIME types for document upload
 */
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

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

/**
 * Maximum file size in bytes (50 MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * File extension to MIME type mapping
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
};
