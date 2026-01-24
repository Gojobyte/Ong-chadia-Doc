// Folder Types for GED System

export interface FolderResponse {
  id: string;
  name: string;
  parentId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  children?: FolderResponse[];
  _count?: {
    children: number;
  };
}

export interface CreateFolderDto {
  name: string;
  parentId?: string | null;
}

export interface UpdateFolderDto {
  name?: string;
  parentId?: string | null;
}

export interface FolderListResponse {
  data: FolderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
