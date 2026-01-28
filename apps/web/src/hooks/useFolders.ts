import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersService } from '@/services/folders.service';
import { toast } from '@/hooks/useToast';
import type { CreateFolderDto, UpdateFolderDto } from '@ong-chadia/shared';

// Cache durations optimized for folder data
const FOLDER_STALE_TIME = 1000 * 60 * 10; // 10 minutes - folders change rarely
const FOLDER_GC_TIME = 1000 * 60 * 30; // 30 minutes garbage collection

/**
 * Get root folders
 */
export function useRootFolders() {
  return useQuery({
    queryKey: ['folders', 'root'],
    queryFn: foldersService.getRootFolders,
    staleTime: FOLDER_STALE_TIME,
    gcTime: FOLDER_GC_TIME,
  });
}

/**
 * Get children of a specific folder
 */
export function useFolderChildren(folderId: string | null) {
  return useQuery({
    queryKey: ['folders', folderId, 'children'],
    queryFn: () => foldersService.getFolderChildren(folderId!),
    enabled: !!folderId,
    staleTime: FOLDER_STALE_TIME,
    gcTime: FOLDER_GC_TIME,
  });
}

/**
 * Get a single folder by ID
 */
export function useFolder(id: string | null) {
  return useQuery({
    queryKey: ['folders', id],
    queryFn: () => foldersService.getFolderById(id!),
    enabled: !!id,
    staleTime: FOLDER_STALE_TIME,
    gcTime: FOLDER_GC_TIME,
  });
}

/**
 * Get folder path for breadcrumb
 */
export function useFolderPath(id: string | null) {
  return useQuery({
    queryKey: ['folders', id, 'path'],
    queryFn: () => foldersService.getFolderPath(id!),
    enabled: !!id,
    staleTime: FOLDER_STALE_TIME,
    gcTime: FOLDER_GC_TIME,
  });
}

/**
 * Create a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderDto) => foldersService.createFolder(data),
    onSuccess: (_, variables) => {
      // Invalidate root folders if no parent
      if (!variables.parentId) {
        queryClient.invalidateQueries({ queryKey: ['folders', 'root'] });
      } else {
        // Invalidate parent's children
        queryClient.invalidateQueries({
          queryKey: ['folders', variables.parentId, 'children'],
        });
      }
      toast({
        title: 'Succès',
        description: 'Dossier créé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la création du dossier',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a folder
 */
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderDto }) =>
      foldersService.updateFolder(id, data),
    onSuccess: () => {
      // Invalidate all folders queries as structure might change
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: 'Succès',
        description: 'Dossier modifié avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la modification du dossier',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a folder
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => foldersService.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: 'Succès',
        description: 'Dossier supprimé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la suppression du dossier',
        variant: 'destructive',
      });
    },
  });
}
