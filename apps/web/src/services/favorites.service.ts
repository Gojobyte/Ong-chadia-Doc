import { api } from './api';

export interface FavoriteDocument {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface FavoriteFolder {
  id: string;
  name: string;
}

export interface FavoriteItem {
  id: string;
  type: 'document' | 'folder';
  document?: FavoriteDocument;
  folder?: FavoriteFolder;
  createdAt: string;
}

export interface FavoritesResponse {
  favorites: FavoriteItem[];
  count: number;
}

export interface RecentDocument {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  lastAccessedAt: string;
  folder?: {
    id: string;
    name: string;
  };
}

export interface QuickAccessDocument {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  accessCount: number;
}

export const favoritesService = {
  /**
   * Get all favorites for current user
   */
  async getFavorites(): Promise<FavoritesResponse> {
    const response = await api.get<FavoritesResponse>('/favorites');
    return response.data;
  },

  /**
   * Get favorites count
   */
  async getCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/favorites/count');
    return response.data.count;
  },

  /**
   * Add document to favorites
   */
  async addDocumentFavorite(documentId: string): Promise<FavoriteItem> {
    const response = await api.post<FavoriteItem>('/favorites', { documentId });
    return response.data;
  },

  /**
   * Add folder to favorites
   */
  async addFolderFavorite(folderId: string): Promise<FavoriteItem> {
    const response = await api.post<FavoriteItem>('/favorites', { folderId });
    return response.data;
  },

  /**
   * Remove favorite by ID
   */
  async removeFavorite(favoriteId: string): Promise<void> {
    await api.delete(`/favorites/${favoriteId}`);
  },

  /**
   * Remove document from favorites
   */
  async removeDocumentFavorite(documentId: string): Promise<void> {
    await api.delete(`/favorites/document/${documentId}`);
  },

  /**
   * Remove folder from favorites
   */
  async removeFolderFavorite(folderId: string): Promise<void> {
    await api.delete(`/favorites/folder/${folderId}`);
  },

  /**
   * Check if document is favorite
   */
  async isDocumentFavorite(documentId: string): Promise<boolean> {
    const response = await api.get<{ isFavorite: boolean }>(`/favorites/check/document/${documentId}`);
    return response.data.isFavorite;
  },

  /**
   * Check if folder is favorite
   */
  async isFolderFavorite(folderId: string): Promise<boolean> {
    const response = await api.get<{ isFavorite: boolean }>(`/favorites/check/folder/${folderId}`);
    return response.data.isFavorite;
  },

  /**
   * Get recent documents
   */
  async getRecentDocuments(limit: number = 20): Promise<RecentDocument[]> {
    const response = await api.get<{ documents: RecentDocument[] }>('/favorites/recent', {
      params: { limit },
    });
    return response.data.documents;
  },

  /**
   * Get quick access documents (most accessed)
   */
  async getQuickAccess(limit: number = 5, days: number = 30): Promise<QuickAccessDocument[]> {
    const response = await api.get<{ documents: QuickAccessDocument[] }>('/favorites/quick-access', {
      params: { limit, days },
    });
    return response.data.documents;
  },
};
