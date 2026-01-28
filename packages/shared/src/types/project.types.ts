// Project Status Enum
export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PREPARATION = 'PREPARATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Project Role Enum
export enum ProjectRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER',
  VOLUNTEER = 'VOLUNTEER',
}

// Base Project interface
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  budget: string | null; // Decimal as string for precision
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Project with counts (for list view)
export interface ProjectWithCounts extends Project {
  _count?: {
    members: number;
    documents: number;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Create Project DTO
export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

// Update Project DTO
export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
}

// Project Filters
export interface ProjectFilters {
  status?: ProjectStatus | ProjectStatus[];
  createdById?: string;
  search?: string;
}

// Project List Query Params
export interface ProjectQueryParams extends ProjectFilters {
  page?: number;
  limit?: number;
  sort?: 'name' | 'createdAt' | 'startDate' | 'endDate' | 'status';
  order?: 'asc' | 'desc';
}

// Paginated Project Response
export interface PaginatedProjectsResponse {
  data: ProjectWithCounts[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Project Member interface
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  assignedById: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string; // System role
  };
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Add Member DTO
export interface AddMemberDto {
  userId: string;
  role: ProjectRole;
}

// Update Member Role DTO
export interface UpdateMemberRoleDto {
  role: ProjectRole;
}

// Project Members Response
export interface ProjectMembersResponse {
  data: ProjectMember[];
  count: number;
}

// Project Document Link
export interface ProjectDocument {
  id: string;
  projectId: string;
  documentId: string;
  linkedById: string;
  linkedAt: string;
  createdAt: string;
  document?: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    createdAt: string;
    folder?: {
      id: string;
      name: string;
    };
  };
  linkedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Link Document DTO
export interface LinkDocumentDto {
  documentId: string;
}

// Link Folder DTO
export interface LinkFolderDto {
  recursive?: boolean;
}

// Project Documents Response
export interface ProjectDocumentsResponse {
  data: ProjectDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Link Folder Result
export interface LinkFolderResult {
  linkedCount: number;
  skippedCount: number;
  documents: ProjectDocument[];
}
