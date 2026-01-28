import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsService } from '@/services/tags.service';
import { toast } from '@/hooks/useToast';

// Query keys
const TAGS_KEY = ['tags'];
const POPULAR_TAGS_KEY = ['tags', 'popular'];

/**
 * Get all tags
 */
export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: () => tagsService.getAllTags(),
  });
}

/**
 * Search tags (autocomplete)
 */
export function useSearchTags(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['tags', 'search', query],
    queryFn: () => tagsService.searchTags(query),
    enabled: enabled && query.length > 0,
  });
}

/**
 * Get popular tags
 */
export function usePopularTags(limit: number = 10) {
  return useQuery({
    queryKey: [...POPULAR_TAGS_KEY, limit],
    queryFn: () => tagsService.getPopularTags(limit),
  });
}

/**
 * Get document tags
 */
export function useDocumentTags(documentId: string | null) {
  return useQuery({
    queryKey: ['documents', documentId, 'tags'],
    queryFn: () => tagsService.getDocumentTags(documentId!),
    enabled: !!documentId,
  });
}

/**
 * Create a tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      tagsService.createTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le tag',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; color?: string }) =>
      tagsService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast({
        title: 'Tag mis à jour',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le tag',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast({
        title: 'Tag supprimé',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le tag',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Merge tags
 */
export function useMergeTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceTagId, targetTagId }: { sourceTagId: string; targetTagId: string }) =>
      tagsService.mergeTags(sourceTagId, targetTagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast({
        title: 'Tags fusionnés',
        description: 'Les documents ont été mis à jour',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de fusionner les tags',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Add tags to document
 */
export function useAddDocumentTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      tagIds,
      tagNames,
    }: {
      documentId: string;
      tagIds?: string[];
      tagNames?: string[];
    }) => tagsService.addDocumentTags(documentId, tagIds, tagNames),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'tags'] });
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter le tag",
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove tag from document
 */
export function useRemoveDocumentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, tagId }: { documentId: string; tagId: string }) =>
      tagsService.removeDocumentTag(documentId, tagId),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'tags'] });
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le tag',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Set all document tags
 */
export function useSetDocumentTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, tagIds }: { documentId: string; tagIds: string[] }) =>
      tagsService.setDocumentTags(documentId, tagIds),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'tags'] });
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast({
        title: 'Tags mis à jour',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les tags',
        variant: 'destructive',
      });
    },
  });
}
