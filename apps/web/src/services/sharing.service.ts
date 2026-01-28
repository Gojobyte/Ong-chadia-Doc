import { api } from './api';
import type {
  CreateShareLinkDto,
  ShareLinkResponse,
  ShareLinkListResponse,
  AccessLogListResponse,
  AccessLogQueryParams,
} from '@ong-chadia/shared';

export const sharingService = {
  /**
   * Create a share link for a document
   */
  async createShareLink(
    documentId: string,
    data: CreateShareLinkDto
  ): Promise<ShareLinkResponse> {
    const response = await api.post<ShareLinkResponse>(
      `/documents/${documentId}/share`,
      data
    );
    return response.data;
  },

  /**
   * Get all active share links for a document
   */
  async getShareLinks(documentId: string): Promise<ShareLinkResponse[]> {
    const response = await api.get<ShareLinkListResponse>(
      `/documents/${documentId}/share-links`
    );
    return response.data.data;
  },

  /**
   * Revoke a share link
   */
  async revokeShareLink(documentId: string, linkId: string): Promise<void> {
    await api.delete(`/documents/${documentId}/share/${linkId}`);
  },

  /**
   * Get access logs for a document (Super-Admin only)
   */
  async getAccessLogs(
    documentId: string,
    params?: AccessLogQueryParams
  ): Promise<AccessLogListResponse> {
    const response = await api.get<AccessLogListResponse>(
      `/documents/${documentId}/access-logs`,
      { params }
    );
    return response.data;
  },
};
