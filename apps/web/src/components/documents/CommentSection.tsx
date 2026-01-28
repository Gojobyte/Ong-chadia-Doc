import { useState } from 'react';
import { MessageSquare, Send, Loader2, MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react';
import { useDocumentComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeDate } from '@/lib/utils';
import type { DocumentComment } from '@ong-chadia/shared';

interface CommentSectionProps {
  documentId: string;
}

export function CommentSection({ documentId }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

  const { data, isLoading } = useDocumentComments(documentId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const comments = data?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment.mutateAsync({
      documentId,
      data: { content: newComment.trim() },
    });
    setNewComment('');
  };

  const handleUpdate = async () => {
    if (!editingComment || !editingComment.content.trim()) return;

    await updateComment.mutateAsync({
      documentId,
      commentId: editingComment.id,
      data: { content: editingComment.content.trim() },
    });
    setEditingComment(null);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    await deleteComment.mutateAsync({ documentId, commentId });
  };

  const getInitials = (comment: DocumentComment) => {
    if (comment.author) {
      return `${comment.author.firstName[0]}${comment.author.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  const getAuthorName = (comment: DocumentComment) => {
    if (comment.author) {
      return `${comment.author.firstName} ${comment.author.lastName}`;
    }
    return 'Utilisateur';
  };

  const isOwnComment = (comment: DocumentComment) => {
    return user?.id === comment.authorId;
  };

  const canDeleteComment = (comment: DocumentComment) => {
    return isOwnComment(comment) || user?.role === 'STAFF' || user?.role === 'SUPER_ADMIN';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Commentaires ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar
          fallback={user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          size="sm"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aucun commentaire pour l'instant</p>
            <p className="text-xs text-slate-400">Soyez le premier à commenter</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar
                fallback={getInitials(comment)}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 text-sm">
                      {getAuthorName(comment)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatRelativeDate(comment.createdAt)}
                    </span>
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-slate-400">(modifié)</span>
                    )}
                  </div>

                  {(isOwnComment(comment) || canDeleteComment(comment)) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        {isOwnComment(comment) && (
                          <DropdownMenuItem
                            onClick={() => setEditingComment({ id: comment.id, content: comment.content })}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        )}
                        {canDeleteComment(comment) && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {editingComment?.id === comment.id ? (
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={editingComment.content}
                      onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingComment(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleUpdate}
                      disabled={updateComment.isPending}
                    >
                      {updateComment.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
