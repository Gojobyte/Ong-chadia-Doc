import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '@/services/sharing.service';
import { toast } from '@/hooks/useToast';
import type { CreateShareLinkDto, AccessLogQueryParams } from '@ong-chadia/shared';

/**
 * Hook to get share links for a document
 */
export function useShareLinks(documentId: string | null) {
  return useQuery({
    queryKey: ['documents', documentId, 'share-links'],
    queryFn: () => sharingService.getShareLinks(documentId!),
    enabled: !!documentId,
  });
}

/**
 * Hook to create a share link
 */
export function useCreateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      data,
    }: {
      documentId: string;
      data: CreateShareLinkDto;
    }) => sharingService.createShareLink(documentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'share-links'],
      });
      toast({
        title: 'Lien créé',
        description: 'Le lien de partage a été créé avec succès',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le lien de partage',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to revoke a share link
 */
export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      linkId,
    }: {
      documentId: string;
      linkId: string;
    }) => sharingService.revokeShareLink(documentId, linkId),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'share-links'],
      });
      toast({
        title: 'Lien révoqué',
        description: 'Le lien de partage a été révoqué',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de révoquer le lien',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get access logs for a document (Super-Admin only)
 */
export function useAccessLogs(
  documentId: string | null,
  params?: AccessLogQueryParams
) {
  return useQuery({
    queryKey: ['documents', documentId, 'access-logs', params],
    queryFn: () => sharingService.getAccessLogs(documentId!, params),
    enabled: !!documentId,
  });
}
