import { api } from './api';
import type {
  DocumentComment,
  CommentsListResponse,
  CreateCommentDto,
  UpdateCommentDto,
} from '@ong-chadia/shared';

export const commentsService = {
  /**
   * Get all comments for a document
   */
  async getComments(documentId: string, params?: { page?: number; limit?: number }): Promise<CommentsListResponse> {
    const response = await api.get<CommentsListResponse>(`/documents/${documentId}/comments`, { params });
    return response.data;
  },

  /**
   * Create a comment on a document
   */
  async createComment(documentId: string, data: CreateCommentDto): Promise<DocumentComment> {
    const response = await api.post<DocumentComment>(`/documents/${documentId}/comments`, data);
    return response.data;
  },

  /**
   * Update a comment
   */
  async updateComment(documentId: string, commentId: string, data: UpdateCommentDto): Promise<DocumentComment> {
    const response = await api.patch<DocumentComment>(`/documents/${documentId}/comments/${commentId}`, data);
    return response.data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(documentId: string, commentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}/comments/${commentId}`);
  },
};
