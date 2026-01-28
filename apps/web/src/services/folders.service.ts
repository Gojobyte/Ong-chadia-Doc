import { api } from './api';
import type {
  FolderResponse,
  FolderListResponse,
  CreateFolderDto,
  UpdateFolderDto,
} from '@ong-chadia/shared';

export interface FoldersParams {
  page?: number;
  limit?: number;
}

export const foldersService = {
  /**
   * Get root folders (folders without parent)
   */
  async getRootFolders(): Promise<FolderResponse[]> {
    const response = await api.get<FolderListResponse>('/folders', {
      params: { parentId: 'null' },
    });
    return response.data.data;
  },

  /**
   * Get children of a specific folder
   */
  async getFolderChildren(folderId: string): Promise<FolderResponse[]> {
    const response = await api.get<{ data: FolderResponse[] }>(
      `/folders/${folderId}/children`
    );
    return response.data.data;
  },

  /**
   * Get a single folder by ID
   */
  async getFolderById(id: string): Promise<FolderResponse> {
    const response = await api.get<{ data: FolderResponse }>(`/folders/${id}`);
    return response.data.data;
  },

  /**
   * Get folder with its full path (for breadcrumb)
   * Uses optimized backend endpoint with recursive CTE (single query instead of N+1)
   */
  async getFolderPath(id: string): Promise<FolderResponse[]> {
    const response = await api.get<{ data: FolderResponse[] }>(`/folders/${id}/path`);
    return response.data.data;
  },

  /**
   * Create a new folder
   */
  async createFolder(data: CreateFolderDto): Promise<FolderResponse> {
    const response = await api.post<{ data: FolderResponse }>('/folders', data);
    return response.data.data;
  },

  /**
   * Update a folder
   */
  async updateFolder(id: string, data: UpdateFolderDto): Promise<FolderResponse> {
    const response = await api.patch<{ data: FolderResponse }>(`/folders/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a folder
   */
  async deleteFolder(id: string): Promise<void> {
    await api.delete(`/folders/${id}`);
  },
};
