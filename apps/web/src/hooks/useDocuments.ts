import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService, type UploadProgressCallback } from '@/services/documents.service';
import { toast } from '@/hooks/useToast';
import type { DocumentListQueryParams, UpdateDocumentDto } from '@ong-chadia/shared';

// Cache durations optimized for document data
const DOCUMENT_LIST_STALE_TIME = 1000 * 60 * 2; // 2 minutes - lists change more often
const DOCUMENT_DETAIL_STALE_TIME = 1000 * 60 * 5; // 5 minutes - details change less often
const SEARCH_STALE_TIME = 1000 * 30; // 30 seconds - search results should be fresh
const GC_TIME = 1000 * 60 * 15; // 15 minutes garbage collection

/**
 * Get documents by folder
 */
export function useDocumentsByFolder(
  folderId: string | null,
  params?: DocumentListQueryParams
) {
  return useQuery({
    queryKey: ['documents', folderId, params],
    queryFn: () => documentsService.getByFolder(folderId!, params),
    enabled: !!folderId,
    staleTime: DOCUMENT_LIST_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Search documents
 */
export function useDocumentSearch(params: {
  q?: string;
  type?: string;
  folderId?: string;
  recursive?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['documents', 'search', params],
    queryFn: () => documentsService.search(params),
    enabled: !!(params.q || params.type || params.folderId),
    staleTime: SEARCH_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Get all documents (for document picker)
 */
export function useAllDocuments(params: {
  q?: string;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ['documents', 'all', params],
    queryFn: () => documentsService.search({ ...params, q: params.q || '' }),
    staleTime: DOCUMENT_LIST_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Get single document by ID
 */
export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsService.getById(id!),
    enabled: !!id,
    staleTime: DOCUMENT_DETAIL_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Upload document mutation with progress tracking
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      folderId,
      onProgress,
    }: {
      file: File;
      folderId: string;
      onProgress?: UploadProgressCallback;
    }) => documentsService.upload(file, folderId, onProgress),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', folderId] });
      toast({
        title: 'Succès',
        description: 'Document téléversé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du téléversement',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update document mutation
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast({
        title: 'Succès',
        description: 'Document modifié avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la modification',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete document mutation
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get download URL
 */
export function useDocumentDownloadUrl(id: string | null) {
  return useQuery({
    queryKey: ['documents', id, 'download'],
    queryFn: () => documentsService.getDownloadUrl(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 45, // URLs valid for 1 hour, refresh after 45 min
    gcTime: 1000 * 60 * 50, // Keep in cache until near expiry
  });
}

// =====================
// VERSION HOOKS
// =====================

/**
 * Get versions of a document
 */
export function useDocumentVersions(documentId: string | null) {
  return useQuery({
    queryKey: ['documents', documentId, 'versions'],
    queryFn: () => documentsService.getVersions(documentId!),
    enabled: !!documentId,
    staleTime: DOCUMENT_DETAIL_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Upload new version mutation
 */
export function useUploadVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      file,
      onProgress,
    }: {
      documentId: string;
      file: File;
      onProgress?: (percent: number) => void;
    }) => documentsService.uploadVersion(documentId, file, onProgress),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'versions'] });
      toast({
        title: 'Succès',
        description: 'Nouvelle version téléversée',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du téléversement',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Restore version mutation
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentsService.restoreVersion(documentId, versionId),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'versions'] });
      toast({
        title: 'Succès',
        description: 'Version restaurée',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la restauration',
        variant: 'destructive',
      });
    },
  });
}
