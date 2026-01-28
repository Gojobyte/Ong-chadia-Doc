import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/useToast';
import * as bulkService from '@/services/bulk.service';

export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentIds: string[]) => bulkService.bulkDelete(documentIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });

      if (result.deleted > 0) {
        toast({
          title: `${result.deleted} document${result.deleted > 1 ? 's' : ''} supprimé${result.deleted > 1 ? 's' : ''}`,
          variant: 'success',
        });
      }
      if (result.failed.length > 0) {
        toast({
          title: 'Erreur',
          description: `${result.failed.length} document${result.failed.length > 1 ? 's' : ''} n'ont pas pu être supprimés`,
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentIds, targetFolderId }: { documentIds: string[]; targetFolderId: string }) =>
      bulkService.bulkMove(documentIds, targetFolderId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });

      if (result.moved > 0) {
        toast({
          title: `${result.moved} document${result.moved > 1 ? 's' : ''} déplacé${result.moved > 1 ? 's' : ''}`,
          variant: 'success',
        });
      }
      if (result.failed.length > 0) {
        toast({
          title: 'Erreur',
          description: `${result.failed.length} document${result.failed.length > 1 ? 's' : ''} n'ont pas pu être déplacés`,
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du déplacement',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkAddTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentIds,
      tagIds,
      tagNames,
    }: {
      documentIds: string[];
      tagIds?: string[];
      tagNames?: string[];
    }) => bulkService.bulkAddTags(documentIds, tagIds, tagNames),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });

      if (result.tagged > 0) {
        toast({
          title: `Tags ajoutés à ${result.tagged} document${result.tagged > 1 ? 's' : ''}`,
          variant: 'success',
        });
      }
      if (result.failed.length > 0) {
        toast({
          title: 'Erreur',
          description: `Échec pour ${result.failed.length} document${result.failed.length > 1 ? 's' : ''}`,
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'ajout des tags",
        variant: 'destructive',
      });
    },
  });
}
