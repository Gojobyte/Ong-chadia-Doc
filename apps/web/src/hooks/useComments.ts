import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services/comments.service';
import { toast } from '@/hooks/useToast';
import type { CreateCommentDto, UpdateCommentDto } from '@ong-chadia/shared';

const COMMENTS_STALE_TIME = 1000 * 60; // 1 minute
const GC_TIME = 1000 * 60 * 10; // 10 minutes

/**
 * Get comments for a document
 */
export function useDocumentComments(documentId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['documents', documentId, 'comments', params],
    queryFn: () => commentsService.getComments(documentId!, params),
    enabled: !!documentId,
    staleTime: COMMENTS_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Create a comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: CreateCommentDto }) =>
      commentsService.createComment(documentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'comments'] });
      toast({
        title: 'Succès',
        description: 'Commentaire ajouté',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter le commentaire',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, commentId, data }: { documentId: string; commentId: string; data: UpdateCommentDto }) =>
      commentsService.updateComment(documentId, commentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'comments'] });
      toast({
        title: 'Succès',
        description: 'Commentaire modifié',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le commentaire',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, commentId }: { documentId: string; commentId: string }) =>
      commentsService.deleteComment(documentId, commentId),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'comments'] });
      toast({
        title: 'Succès',
        description: 'Commentaire supprimé',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    },
  });
}
