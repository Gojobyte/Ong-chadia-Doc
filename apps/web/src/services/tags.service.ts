import { api } from './api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdById: string;
  createdAt: string;
  _count?: {
    documents: number;
  };
}

export interface TagsResponse {
  tags: Tag[];
}

export const tagsService = {
  /**
   * Get all tags
   */
  async getAllTags(): Promise<Tag[]> {
    const response = await api.get<TagsResponse>('/tags');
    return response.data.tags;
  },

  /**
   * Search tags (autocomplete)
   */
  async searchTags(query: string, limit: number = 10): Promise<Tag[]> {
    const response = await api.get<TagsResponse>('/tags/search', {
      params: { q: query, limit },
    });
    return response.data.tags;
  },

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const response = await api.get<TagsResponse>('/tags/popular', {
      params: { limit },
    });
    return response.data.tags;
  },

  /**
   * Create a tag
   */
  async createTag(name: string, color: string = '#6366f1'): Promise<Tag> {
    const response = await api.post<Tag>('/tags', { name, color });
    return response.data;
  },

  /**
   * Update a tag
   */
  async updateTag(id: string, data: { name?: string; color?: string }): Promise<Tag> {
    const response = await api.patch<Tag>(`/tags/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tag
   */
  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },

  /**
   * Merge tags
   */
  async mergeTags(sourceTagId: string, targetTagId: string): Promise<Tag> {
    const response = await api.post<Tag>('/tags/merge', { sourceTagId, targetTagId });
    return response.data;
  },

  /**
   * Get document tags
   */
  async getDocumentTags(documentId: string): Promise<Tag[]> {
    const response = await api.get<TagsResponse>(`/documents/${documentId}/tags`);
    return response.data.tags;
  },

  /**
   * Add tags to document
   */
  async addDocumentTags(
    documentId: string,
    tagIds?: string[],
    tagNames?: string[]
  ): Promise<Tag[]> {
    const response = await api.post<TagsResponse>(`/documents/${documentId}/tags`, {
      tagIds,
      tagNames,
    });
    return response.data.tags;
  },

  /**
   * Remove tag from document
   */
  async removeDocumentTag(documentId: string, tagId: string): Promise<void> {
    await api.delete(`/documents/${documentId}/tags/${tagId}`);
  },

  /**
   * Set all document tags (replace)
   */
  async setDocumentTags(documentId: string, tagIds: string[]): Promise<Tag[]> {
    const response = await api.put<TagsResponse>(`/documents/${documentId}/tags`, { tagIds });
    return response.data.tags;
  },
};
