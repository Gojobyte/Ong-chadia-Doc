import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import type { DocumentComment, CommentsListResponse } from '@ong-chadia/shared';

/**
 * Get all comments for a document
 */
export async function getComments(
  documentId: string,
  params: { page?: number; limit?: number } = {}
): Promise<CommentsListResponse> {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const skip = (page - 1) * limit;

  // Verify document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const [comments, total] = await Promise.all([
    prisma.documentComment.findMany({
      where: { documentId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.documentComment.count({ where: { documentId } }),
  ]);

  return {
    data: comments.map(mapCommentToResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Create a comment on a document
 */
export async function createComment(
  documentId: string,
  authorId: string,
  content: string
): Promise<DocumentComment> {
  // Verify document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const comment = await prisma.documentComment.create({
    data: {
      documentId,
      authorId,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return mapCommentToResponse(comment);
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<DocumentComment> {
  // Find the comment
  const comment = await prisma.documentComment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true },
  });

  if (!comment) {
    throw new NotFoundError('Commentaire non trouvé');
  }

  // Only the author can update their comment
  if (comment.authorId !== userId) {
    throw new ForbiddenError('Vous ne pouvez modifier que vos propres commentaires');
  }

  const updated = await prisma.documentComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return mapCommentToResponse(updated);
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentId: string,
  userId: string,
  userRole: string
): Promise<void> {
  // Find the comment
  const comment = await prisma.documentComment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true },
  });

  if (!comment) {
    throw new NotFoundError('Commentaire non trouvé');
  }

  // Only the author or staff+ can delete comments
  const isStaffOrAbove = userRole === 'STAFF' || userRole === 'SUPER_ADMIN';
  if (comment.authorId !== userId && !isStaffOrAbove) {
    throw new ForbiddenError('Vous ne pouvez supprimer que vos propres commentaires');
  }

  await prisma.documentComment.delete({
    where: { id: commentId },
  });
}

/**
 * Map Prisma comment to response format
 */
function mapCommentToResponse(comment: any): DocumentComment {
  return {
    id: comment.id,
    documentId: comment.documentId,
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  };
}
