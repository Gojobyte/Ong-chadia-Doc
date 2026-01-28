/**
 * Document version response format
 */
export interface DocumentVersionResponse {
  id: string;
  documentId: string;
  versionNumber: number;
  name?: string | null; // File name for this version
  mimeType?: string | null; // MIME type for this version
  size: number;
  uploadedById: string;
  createdAt: string;
  url?: string; // Signed URL (temporary)
  isCurrent: boolean;
}

/**
 * Version list response
 */
export interface VersionListResponse {
  documentId: string;
  documentName: string;
  currentVersionId: string | null;
  versions: DocumentVersionResponse[];
}

/**
 * Upload new version DTO
 */
export interface UploadVersionDto {
  documentId: string;
}

/**
 * Restore version DTO
 */
export interface RestoreVersionDto {
  versionId: string;
}
