import { api } from './api';

export interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface MetadataTemplate {
  id: string;
  name: string;
  folderId: string | null;
  fields: MetadataField[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
  folder?: {
    id: string;
    name: string;
  };
}

export interface DocumentMetadata {
  id: string;
  documentId: string;
  templateId: string;
  template: MetadataTemplate;
  values: Record<string, unknown>;
  updatedAt: string;
}

export const metadataService = {
  // ================
  // TEMPLATES
  // ================

  /**
   * Get all metadata templates
   */
  async getAllTemplates(): Promise<MetadataTemplate[]> {
    const response = await api.get<{ templates: MetadataTemplate[] }>('/metadata/templates');
    return response.data.templates;
  },

  /**
   * Get templates for a specific folder (including inherited)
   */
  async getTemplatesForFolder(folderId: string): Promise<MetadataTemplate[]> {
    const response = await api.get<{ templates: MetadataTemplate[] }>('/metadata/templates', {
      params: { folderId },
    });
    return response.data.templates;
  },

  /**
   * Get a specific template
   */
  async getTemplate(id: string): Promise<MetadataTemplate> {
    const response = await api.get<MetadataTemplate>(`/metadata/templates/${id}`);
    return response.data;
  },

  /**
   * Create a new template
   */
  async createTemplate(data: {
    name: string;
    fields: MetadataField[];
    folderId?: string;
  }): Promise<MetadataTemplate> {
    const response = await api.post<MetadataTemplate>('/metadata/templates', data);
    return response.data;
  },

  /**
   * Update a template
   */
  async updateTemplate(
    id: string,
    data: { name?: string; fields?: MetadataField[]; folderId?: string }
  ): Promise<MetadataTemplate> {
    const response = await api.patch<MetadataTemplate>(`/metadata/templates/${id}`, data);
    return response.data;
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/metadata/templates/${id}`);
  },

  // ================
  // DOCUMENT METADATA
  // ================

  /**
   * Get document metadata
   */
  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
    const response = await api.get<{ metadata: DocumentMetadata | null }>(
      `/metadata/documents/${documentId}`
    );
    return response.data.metadata;
  },

  /**
   * Set document metadata
   */
  async setDocumentMetadata(
    documentId: string,
    templateId: string,
    values: Record<string, unknown>
  ): Promise<DocumentMetadata> {
    const response = await api.post<{ metadata: DocumentMetadata }>(
      `/metadata/documents/${documentId}`,
      { templateId, values }
    );
    return response.data.metadata;
  },

  /**
   * Update document metadata values
   */
  async updateDocumentMetadata(
    documentId: string,
    values: Record<string, unknown>
  ): Promise<DocumentMetadata> {
    const response = await api.patch<{ metadata: DocumentMetadata }>(
      `/metadata/documents/${documentId}`,
      { values }
    );
    return response.data.metadata;
  },

  /**
   * Remove document metadata
   */
  async removeDocumentMetadata(documentId: string): Promise<void> {
    await api.delete(`/metadata/documents/${documentId}`);
  },
};
