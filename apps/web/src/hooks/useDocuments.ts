import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService, type UploadProgressCallback } from '@/services/documents.service';
import { toast } from '@/hooks/useToast';
import type { DocumentListQueryParams, UpdateDocumentDto } from '@ong-chadia/shared';

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
    staleTime: 1000 * 60 * 5, // URLs are valid for ~15 min, refetch after 5
  });
}
