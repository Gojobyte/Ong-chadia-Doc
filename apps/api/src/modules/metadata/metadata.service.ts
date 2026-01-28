import { prisma } from '../../config/database.js';
import type { Prisma } from '@prisma/client';

export interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  options?: string[]; // For select type
}

export interface MetadataTemplateWithCount {
  id: string;
  name: string;
  folderId: string | null;
  fields: MetadataField[];
  createdAt: Date;
  updatedAt: Date;
  _count: {
    documents: number;
  };
}

// Get all metadata templates
export async function getAllTemplates(): Promise<MetadataTemplateWithCount[]> {
  const templates = await prisma.metadataTemplate.findMany({
    include: {
      _count: {
        select: { documents: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return templates.map((t) => ({
    ...t,
    fields: t.fields as unknown as MetadataField[],
  }));
}

// Get templates for a specific folder (including inherited from parents)
export async function getTemplatesForFolder(folderId: string | null): Promise<MetadataTemplateWithCount[]> {
  if (!folderId) {
    // Root folder - get global templates only
    const templates = await prisma.metadataTemplate.findMany({
      where: { folderId: null },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });
    return templates.map((t) => ({
      ...t,
      fields: t.fields as unknown as MetadataField[],
    }));
  }

  // Get folder hierarchy to find all applicable templates
  const folderPath: string[] = [folderId];
  let currentFolder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: { parentId: true },
  });

  while (currentFolder?.parentId) {
    folderPath.push(currentFolder.parentId);
    currentFolder = await prisma.folder.findUnique({
      where: { id: currentFolder.parentId },
      select: { parentId: true },
    });
  }

  // Get templates for this folder and all parent folders
  const templates = await prisma.metadataTemplate.findMany({
    where: {
      OR: [
        { folderId: { in: folderPath } },
        { folderId: null }, // Global templates
      ],
    },
    include: {
      _count: {
        select: { documents: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return templates.map((t) => ({
    ...t,
    fields: t.fields as unknown as MetadataField[],
  }));
}

// Get template by ID
export async function getTemplateById(id: string) {
  const template = await prisma.metadataTemplate.findUnique({
    where: { id },
    include: {
      folder: {
        select: { id: true, name: true },
      },
      _count: {
        select: { documents: true },
      },
    },
  });

  if (!template) return null;

  return {
    ...template,
    fields: template.fields as unknown as MetadataField[],
  };
}

// Create a new template
export async function createTemplate(
  name: string,
  fields: MetadataField[],
  folderId?: string | null
) {
  return prisma.metadataTemplate.create({
    data: {
      name,
      fields: fields as unknown as Parameters<typeof prisma.metadataTemplate.create>[0]['data']['fields'],
      folderId: folderId || null,
    },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });
}

// Update a template
export async function updateTemplate(
  id: string,
  data: { name?: string; fields?: MetadataField[]; folderId?: string | null }
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.fields !== undefined) updateData.fields = data.fields;
  if (data.folderId !== undefined) updateData.folderId = data.folderId;

  return prisma.metadataTemplate.update({
    where: { id },
    data: updateData,
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });
}

// Delete a template
export async function deleteTemplate(id: string) {
  return prisma.metadataTemplate.delete({
    where: { id },
  });
}

// Get document metadata
export async function getDocumentMetadata(documentId: string) {
  const metadata = await prisma.documentMetadata.findUnique({
    where: { documentId },
    include: {
      template: true,
    },
  });

  if (!metadata) return null;

  return {
    ...metadata,
    template: {
      ...metadata.template,
      fields: metadata.template.fields as unknown as MetadataField[],
    },
    values: metadata.values as Record<string, unknown>,
  };
}

// Set document metadata
export async function setDocumentMetadata(
  documentId: string,
  templateId: string,
  values: Record<string, unknown>
) {
  // Validate that the template exists
  const template = await prisma.metadataTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error('Template non trouvé');
  }

  // Validate required fields
  const fields = template.fields as unknown as MetadataField[];
  for (const field of fields) {
    if (field.required && (values[field.key] === undefined || values[field.key] === '')) {
      throw new Error(`Le champ "${field.label}" est requis`);
    }
  }

  // Upsert metadata
  return prisma.documentMetadata.upsert({
    where: { documentId },
    create: {
      documentId,
      templateId,
      values: values as Prisma.InputJsonValue,
    },
    update: {
      templateId,
      values: values as Prisma.InputJsonValue,
    },
    include: {
      template: true,
    },
  });
}

// Update document metadata values
export async function updateDocumentMetadata(
  documentId: string,
  values: Record<string, unknown>
) {
  const existing = await prisma.documentMetadata.findUnique({
    where: { documentId },
    include: { template: true },
  });

  if (!existing) {
    throw new Error('Métadonnées non trouvées');
  }

  // Validate required fields
  const fields = existing.template.fields as unknown as MetadataField[];
  for (const field of fields) {
    if (field.required && (values[field.key] === undefined || values[field.key] === '')) {
      throw new Error(`Le champ "${field.label}" est requis`);
    }
  }

  return prisma.documentMetadata.update({
    where: { documentId },
    data: { values: values as Prisma.InputJsonValue },
    include: {
      template: true,
    },
  });
}

// Remove document metadata
export async function removeDocumentMetadata(documentId: string) {
  return prisma.documentMetadata.delete({
    where: { documentId },
  });
}
