import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../common/errors.js';
import { canAccessFolder } from '../folders/permissions.service.js';
import type { ProjectDocument, ProjectDocumentsResponse, LinkFolderResult } from '@ong-chadia/shared';
import pkg from '@prisma/client';
const { Permission } = pkg;

/**
 * Get all documents linked to a project
 */
export async function getLinkedDocuments(
  projectId: string,
  params: { page?: number; limit?: number } = {}
): Promise<ProjectDocumentsResponse> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  // Verify project exists and is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  const [documents, total] = await Promise.all([
    prisma.projectDocument.findMany({
      where: { projectId },
      skip,
      take: limit,
      orderBy: { linkedAt: 'desc' },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            size: true,
            createdAt: true,
            folder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        linkedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.projectDocument.count({ where: { projectId } }),
  ]);

  return {
    data: documents.map(mapDocumentLinkToResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Link a document to a project
 */
export async function linkDocument(
  projectId: string,
  documentId: string,
  userId: string
): Promise<ProjectDocument> {
  // Verify project exists and is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Verify document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, folderId: true },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  // Check if user has READ access to the document's folder
  const hasAccess = await canAccessFolder(userId, document.folderId, Permission.READ);
  if (!hasAccess) {
    throw new ForbiddenError('Vous n\'avez pas accès à ce document');
  }

  // Check if document is already linked
  const existingLink = await prisma.projectDocument.findUnique({
    where: {
      projectId_documentId: {
        projectId,
        documentId,
      },
    },
  });

  if (existingLink) {
    throw new ConflictError('Ce document est déjà lié au projet');
  }

  // Create link
  const link = await prisma.projectDocument.create({
    data: {
      projectId,
      documentId,
      linkedById: userId,
    },
    include: {
      document: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      linkedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return mapDocumentLinkToResponse(link);
}

/**
 * Link all documents from a folder to a project
 */
export async function linkFolder(
  projectId: string,
  folderId: string,
  userId: string,
  recursive: boolean = false
): Promise<LinkFolderResult> {
  // Verify project exists and is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Verify folder exists
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: { id: true },
  });

  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  // Check if user has READ access to the folder
  const hasAccess = await canAccessFolder(userId, folderId, Permission.READ);
  if (!hasAccess) {
    throw new ForbiddenError('Vous n\'avez pas accès à ce dossier');
  }

  // Get all documents in the folder (and subfolders if recursive)
  const folderIds = recursive
    ? await getAllSubfolderIds(folderId, userId)
    : [folderId];

  const documents = await prisma.document.findMany({
    where: {
      folderId: { in: folderIds },
    },
    select: { id: true },
  });

  // Get already linked document IDs
  const existingLinks = await prisma.projectDocument.findMany({
    where: {
      projectId,
      documentId: { in: documents.map(d => d.id) },
    },
    select: { documentId: true },
  });
  const existingDocIds = new Set(existingLinks.map(l => l.documentId));

  // Filter out already linked documents
  const documentsToLink = documents.filter(d => !existingDocIds.has(d.id));

  // Create links in batch
  if (documentsToLink.length > 0) {
    await prisma.projectDocument.createMany({
      data: documentsToLink.map(doc => ({
        projectId,
        documentId: doc.id,
        linkedById: userId,
      })),
      skipDuplicates: true,
    });
  }

  // Fetch the newly created links with full details
  const newLinks = await prisma.projectDocument.findMany({
    where: {
      projectId,
      documentId: { in: documentsToLink.map(d => d.id) },
    },
    include: {
      document: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      linkedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    linkedCount: documentsToLink.length,
    skippedCount: existingDocIds.size,
    documents: newLinks.map(mapDocumentLinkToResponse),
  };
}

/**
 * Get all subfolder IDs recursively (only those the user has access to)
 */
async function getAllSubfolderIds(folderId: string, userId: string): Promise<string[]> {
  const result: string[] = [folderId];

  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  for (const child of children) {
    const hasAccess = await canAccessFolder(userId, child.id, Permission.READ);
    if (hasAccess) {
      const subfolderIds = await getAllSubfolderIds(child.id, userId);
      result.push(...subfolderIds);
    }
  }

  return result;
}

/**
 * Unlink a document from a project
 */
export async function unlinkDocument(
  projectId: string,
  documentId: string
): Promise<void> {
  // Verify project exists and is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Find and delete the link
  const link = await prisma.projectDocument.findUnique({
    where: {
      projectId_documentId: {
        projectId,
        documentId,
      },
    },
  });

  if (!link) {
    throw new NotFoundError('Document non lié à ce projet');
  }

  await prisma.projectDocument.delete({
    where: { id: link.id },
  });
}

/**
 * Check if a user can access a document via project membership
 */
export async function canAccessDocumentViaProject(
  userId: string,
  documentId: string
): Promise<boolean> {
  const link = await prisma.projectDocument.findFirst({
    where: {
      documentId,
      project: {
        deletedAt: null,
        members: {
          some: { userId },
        },
      },
    },
  });
  return !!link;
}

/**
 * Check if user is a member of the project
 */
export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
  return !!member;
}

/**
 * Map Prisma document link to response format
 */
function mapDocumentLinkToResponse(link: any): ProjectDocument {
  return {
    id: link.id,
    projectId: link.projectId,
    documentId: link.documentId,
    linkedById: link.linkedById,
    linkedAt: link.linkedAt.toISOString(),
    createdAt: link.createdAt.toISOString(),
    document: link.document ? {
      id: link.document.id,
      name: link.document.name,
      mimeType: link.document.mimeType,
      size: link.document.size,
      createdAt: link.document.createdAt.toISOString(),
      folder: link.document.folder,
    } : undefined,
    linkedBy: link.linkedBy,
  };
}
