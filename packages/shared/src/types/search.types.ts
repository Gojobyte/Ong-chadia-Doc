import type { DocumentResponse } from './document.types';

/**
 * Search query parameters
 */
export interface SearchQueryParams {
  q?: string; // Search term
  type?: string; // File types (comma-separated: pdf,docx)
  folderId?: string; // Limit to specific folder
  recursive?: boolean; // Include subfolders
  from?: string; // Date range start (ISO format)
  to?: string; // Date range end (ISO format)
  page?: number;
  limit?: number;
}

/**
 * Search result response
 */
export interface SearchResultResponse {
  data: DocumentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  query: {
    q?: string;
    filters: {
      type?: string[];
      folderId?: string;
      recursive?: boolean;
      dateRange?: {
        from?: string;
        to?: string;
      };
    };
  };
}

/**
 * MIME type mapping for file type shortcuts
 */
export const MIME_TYPE_MAP: Record<string, string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  image: ['image/jpeg', 'image/png', 'image/gif'],
  images: ['image/jpeg', 'image/png', 'image/gif'],
  txt: ['text/plain'],
  text: ['text/plain'],
};
