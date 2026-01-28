import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/services/favorites.service';
import { toast } from '@/hooks/useToast';

// Query keys
const FAVORITES_KEY = ['favorites'];
const FAVORITES_COUNT_KEY = ['favorites', 'count'];
const RECENT_DOCUMENTS_KEY = ['favorites', 'recent'];
const QUICK_ACCESS_KEY = ['favorites', 'quick-access'];

/**
 * Get all favorites
 */
export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: () => favoritesService.getFavorites(),
  });
}

/**
 * Get favorites count
 */
export function useFavoritesCount() {
  return useQuery({
    queryKey: FAVORITES_COUNT_KEY,
    queryFn: () => favoritesService.getCount(),
  });
}

/**
 * Check if a document is favorite
 */
export function useIsDocumentFavorite(documentId: string | null) {
  return useQuery({
    queryKey: ['favorites', 'check', 'document', documentId],
    queryFn: () => favoritesService.isDocumentFavorite(documentId!),
    enabled: !!documentId,
  });
}

/**
 * Check if a folder is favorite
 */
export function useIsFolderFavorite(folderId: string | null) {
  return useQuery({
    queryKey: ['favorites', 'check', 'folder', folderId],
    queryFn: () => favoritesService.isFolderFavorite(folderId!),
    enabled: !!folderId,
  });
}

/**
 * Add document to favorites
 */
export function useAddDocumentFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => favoritesService.addDocumentFavorite(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
      queryClient.invalidateQueries({ queryKey: FAVORITES_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check'] });
      toast({
        title: 'Ajouté aux favoris',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter aux favoris",
        variant: 'destructive',
      });
    },
  });
}

/**
 * Add folder to favorites
 */
export function useAddFolderFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => favoritesService.addFolderFavorite(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
      queryClient.invalidateQueries({ queryKey: FAVORITES_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check'] });
      toast({
        title: 'Ajouté aux favoris',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter aux favoris",
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove document from favorites
 */
export function useRemoveDocumentFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => favoritesService.removeDocumentFavorite(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
      queryClient.invalidateQueries({ queryKey: FAVORITES_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check'] });
      toast({
        title: 'Retiré des favoris',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer des favoris',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove folder from favorites
 */
export function useRemoveFolderFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => favoritesService.removeFolderFavorite(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
      queryClient.invalidateQueries({ queryKey: FAVORITES_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check'] });
      toast({
        title: 'Retiré des favoris',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer des favoris',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Toggle document favorite (add or remove)
 */
export function useToggleDocumentFavorite() {
  const addFavorite = useAddDocumentFavorite();
  const removeFavorite = useRemoveDocumentFavorite();

  return {
    toggle: async (documentId: string, isFavorite: boolean) => {
      if (isFavorite) {
        await removeFavorite.mutateAsync(documentId);
      } else {
        await addFavorite.mutateAsync(documentId);
      }
    },
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
}

/**
 * Get recent documents
 */
export function useRecentDocuments(limit: number = 20) {
  return useQuery({
    queryKey: [...RECENT_DOCUMENTS_KEY, limit],
    queryFn: () => favoritesService.getRecentDocuments(limit),
  });
}

/**
 * Get quick access documents (most accessed)
 */
export function useQuickAccess(limit: number = 5, days: number = 30) {
  return useQuery({
    queryKey: [...QUICK_ACCESS_KEY, limit, days],
    queryFn: () => favoritesService.getQuickAccess(limit, days),
  });
}
