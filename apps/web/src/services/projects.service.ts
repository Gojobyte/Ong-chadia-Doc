import { api } from './api';
import type {
  ProjectWithCounts,
  PaginatedProjectsResponse,
  ProjectQueryParams,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectMembersResponse,
  ProjectDocumentsResponse,
  AddMemberDto,
  UpdateMemberRoleDto,
  LinkDocumentDto,
  LinkFolderResult,
} from '@ong-chadia/shared';

export const projectsService = {
  /**
   * Get all projects with filters and pagination
   */
  async getAll(params?: ProjectQueryParams): Promise<PaginatedProjectsResponse> {
    const response = await api.get<PaginatedProjectsResponse>('/projects', { params });
    return response.data;
  },

  /**
   * Get a project by ID
   */
  async getById(id: string): Promise<ProjectWithCounts> {
    const response = await api.get<ProjectWithCounts>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   */
  async create(data: CreateProjectDto): Promise<ProjectWithCounts> {
    const response = await api.post<ProjectWithCounts>('/projects', data);
    return response.data;
  },

  /**
   * Update a project
   */
  async update(id: string, data: UpdateProjectDto): Promise<ProjectWithCounts> {
    const response = await api.patch<ProjectWithCounts>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete a project (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  // =====================
  // MEMBERS
  // =====================

  /**
   * Get project members
   */
  async getMembers(projectId: string): Promise<ProjectMembersResponse> {
    const response = await api.get<ProjectMembersResponse>(`/projects/${projectId}/members`);
    return response.data;
  },

  /**
   * Add a member to a project
   */
  async addMember(projectId: string, data: AddMemberDto): Promise<void> {
    await api.post(`/projects/${projectId}/members`, data);
  },

  /**
   * Update member role
   */
  async updateMemberRole(projectId: string, memberId: string, data: UpdateMemberRoleDto): Promise<void> {
    await api.patch(`/projects/${projectId}/members/${memberId}`, data);
  },

  /**
   * Remove a member from a project
   */
  async removeMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },

  // =====================
  // DOCUMENTS
  // =====================

  /**
   * Get project documents
   */
  async getDocuments(projectId: string, params?: { page?: number; limit?: number }): Promise<ProjectDocumentsResponse> {
    const response = await api.get<ProjectDocumentsResponse>(`/projects/${projectId}/documents`, { params });
    return response.data;
  },

  /**
   * Link a document to a project
   */
  async linkDocument(projectId: string, data: LinkDocumentDto): Promise<void> {
    await api.post(`/projects/${projectId}/documents`, data);
  },

  /**
   * Link all documents from a folder
   */
  async linkFolder(projectId: string, folderId: string, recursive: boolean = false): Promise<LinkFolderResult> {
    const response = await api.post<LinkFolderResult>(
      `/projects/${projectId}/documents/folder/${folderId}`,
      { recursive }
    );
    return response.data;
  },

  /**
   * Unlink a document from a project
   */
  async unlinkDocument(projectId: string, documentId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/documents/${documentId}`);
  },
};
