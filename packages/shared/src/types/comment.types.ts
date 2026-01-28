/**
 * Document Comment - A comment on a document
 */
export interface DocumentComment {
  id: string;
  documentId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Create Comment DTO
 */
export interface CreateCommentDto {
  content: string;
}

/**
 * Update Comment DTO
 */
export interface UpdateCommentDto {
  content: string;
}

/**
 * Comments List Response
 */
export interface CommentsListResponse {
  data: DocumentComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
