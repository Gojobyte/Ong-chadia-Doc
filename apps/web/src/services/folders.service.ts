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
    const response = await api.get<FolderResponse>(`/folders/${id}`);
    return response.data;
  },

  /**
   * Get folder with its full path (for breadcrumb)
   */
  async getFolderPath(id: string): Promise<FolderResponse[]> {
    const path: FolderResponse[] = [];
    let currentId: string | null = id;

    while (currentId) {
      const folder = await this.getFolderById(currentId);
      path.unshift(folder);
      currentId = folder.parentId;
    }

    return path;
  },

  /**
   * Create a new folder
   */
  async createFolder(data: CreateFolderDto): Promise<FolderResponse> {
    const response = await api.post<FolderResponse>('/folders', data);
    return response.data;
  },

  /**
   * Update a folder
   */
  async updateFolder(id: string, data: UpdateFolderDto): Promise<FolderResponse> {
    const response = await api.patch<FolderResponse>(`/folders/${id}`, data);
    return response.data;
  },

  /**
   * Delete a folder
   */
  async deleteFolder(id: string): Promise<void> {
    await api.delete(`/folders/${id}`);
  },
};
