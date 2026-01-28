import { api } from '@/services/api';

interface BulkOperationResult {
  success?: string[];
  failed: { id: string; error: string }[];
}

interface BulkDeleteResult extends BulkOperationResult {
  deleted: number;
}

interface BulkMoveResult extends BulkOperationResult {
  moved: number;
}

interface BulkTagsResult extends BulkOperationResult {
  tagged: number;
}

interface BulkDownloadResult {
  downloadUrl: string;
  expiresAt: string;
  totalSize: number;
  fileCount: number;
}

interface BulkCopyResult extends BulkOperationResult {
  copied: number;
  newDocumentIds: string[];
}

export async function bulkDelete(documentIds: string[]): Promise<BulkDeleteResult> {
  const response = await api.post('/documents/bulk/delete', { documentIds });
  return response.data;
}

export async function bulkMove(documentIds: string[], targetFolderId: string): Promise<BulkMoveResult> {
  const response = await api.post('/documents/bulk/move', { documentIds, targetFolderId });
  return response.data;
}

export async function bulkAddTags(
  documentIds: string[],
  tagIds?: string[],
  tagNames?: string[]
): Promise<BulkTagsResult> {
  const response = await api.post('/documents/bulk/tags', {
    documentIds,
    tagIds,
    tagNames,
  });
  return response.data;
}

export async function bulkDownload(documentIds: string[]): Promise<BulkDownloadResult> {
  const response = await api.post('/documents/bulk/download', { documentIds });
  return response.data;
}

export async function bulkCopy(documentIds: string[], targetFolderId: string): Promise<BulkCopyResult> {
  const response = await api.post('/documents/bulk/copy', { documentIds, targetFolderId });
  return response.data;
}
