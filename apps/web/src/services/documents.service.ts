import { api } from './api';
import { useAuthStore } from '@/stores/auth.store';
import type {
  DocumentResponse,
  DocumentListQueryParams,
  UpdateDocumentDto,
  DownloadUrlResponse,
} from '@ong-chadia/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DocumentListResponse {
  data: DocumentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadProgressCallback {
  (percent: number): void;
}

export const documentsService = {
  /**
   * Get documents by folder ID
   */
  async getByFolder(
    folderId: string,
    params?: DocumentListQueryParams
  ): Promise<DocumentListResponse> {
    const response = await api.get<DocumentListResponse>(
      `/folders/${folderId}/documents`,
      { params }
    );
    return response.data;
  },

  /**
   * Search documents across all accessible folders
   */
  async search(
    params: {
      q?: string;
      type?: string;
      folderId?: string;
      recursive?: boolean;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<DocumentListResponse> {
    const response = await api.get<DocumentListResponse>('/documents/search', { params });
    return response.data;
  },

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<DocumentResponse> {
    const response = await api.get<DocumentResponse>(`/documents/${id}`);
    return response.data;
  },

  /**
   * Upload a document with progress tracking
   */
  async upload(
    file: File,
    folderId: string,
    onProgress?: UploadProgressCallback
  ): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Invalid server response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error?.message || error.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      xhr.open('POST', `${API_URL}/documents/upload`);

      const token = useAuthStore.getState().accessToken;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  },

  /**
   * Get download URL for a document
   */
  async getDownloadUrl(id: string): Promise<DownloadUrlResponse> {
    const response = await api.get<DownloadUrlResponse>(`/documents/${id}/download`);
    return response.data;
  },

  /**
   * Update document (rename or move)
   */
  async update(id: string, data: UpdateDocumentDto): Promise<DocumentResponse> {
    const response = await api.patch<DocumentResponse>(`/documents/${id}`, data);
    return response.data;
  },

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
