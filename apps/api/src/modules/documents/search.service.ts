import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database.js';
import * as storageService from './storage.service.js';

// Types
interface SearchParams {
  q?: string;
  type?: string;
  folderId?: string;
  recursive?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

interface DocumentSearchResult {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string;
  folderName: string;
  uploadedById: string;
  createdAt: string;
  url?: string;
}

interface SearchResponse {
  data: DocumentSearchResult[];
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

// Local MIME type map
const LOCAL_MIME_TYPE_MAP: Record<string, string[]> = {
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

/**
 * Get all folder IDs accessible by a user based on their role
 */
async function getAccessibleFolderIds(userRole: Role): Promise<string[]> {
  // Super admins have access to all folders
  if (userRole === 'SUPER_ADMIN') {
    const allFolders = await prisma.folder.findMany({ select: { id: true } });
    return allFolders.map((f) => f.id);
  }

  // Get folders where the user's role has any permission
  const permissionFolders = await prisma.folderPermission.findMany({
    where: { role: userRole },
    select: { folderId: true },
  });

  const folderIds = permissionFolders.map((p) => p.folderId);

  // Include parent folders (through inheritance)
  const allAccessibleIds = new Set<string>(folderIds);

  // For each folder with explicit permission, add all descendant folders
  for (const folderId of folderIds) {
    const descendants = await getDescendantFolderIds(folderId);
    descendants.forEach((id) => allAccessibleIds.add(id));
  }

  return Array.from(allAccessibleIds);
}

/**
 * Get all descendant folder IDs recursively
 */
async function getDescendantFolderIds(folderId: string): Promise<string[]> {
  const result: string[] = [folderId];

  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  for (const child of children) {
    const descendants = await getDescendantFolderIds(child.id);
    result.push(...descendants);
  }

  return result;
}

/**
 * Search documents with filtering and pagination
 */
export async function searchDocuments(
  params: SearchParams,
  userRole: Role
): Promise<SearchResponse> {
  const {
    q,
    type,
    folderId,
    recursive = false,
    from,
    to,
    page = 1,
    limit = 50,
  } = params;

  // Get accessible folder IDs for this user
  const accessibleFolderIds = await getAccessibleFolderIds(userRole);

  // Build WHERE clause
  const where: Prisma.DocumentWhereInput = {
    folderId: { in: accessibleFolderIds },
  };

  // Search by name (case-insensitive, partial match)
  if (q) {
    where.name = {
      contains: q,
      mode: 'insensitive',
    };
  }

  // Filter by file type
  let typeFilters: string[] | undefined;
  if (type) {
    const types = type.split(',').map((t) => t.trim().toLowerCase());
    typeFilters = types;
    const mimeTypes = types.flatMap((t) => LOCAL_MIME_TYPE_MAP[t] || []);

    if (mimeTypes.length > 0) {
      where.mimeType = { in: mimeTypes };
    }
  }

  // Filter by folder
  if (folderId) {
    if (recursive) {
      const descendantIds = await getDescendantFolderIds(folderId);
      const accessibleDescendants = descendantIds.filter((id) =>
        accessibleFolderIds.includes(id)
      );
      where.folderId = { in: accessibleDescendants };
    } else {
      // Check if user has access to this folder
      if (accessibleFolderIds.includes(folderId)) {
        where.folderId = folderId;
      } else {
        // User doesn't have access to this folder
        where.folderId = { in: [] }; // Return no results
      }
    }
  }

  // Filter by date range
  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = new Date(from);
    }
    if (to) {
      // Include the entire end date
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  // Execute paginated query
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: { select: { name: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  // Get signed URLs for all documents
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const url = await storageService.getSignedUrl(doc.storagePath);
      return {
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        size: doc.size,
        folderId: doc.folderId,
        folderName: doc.folder.name,
        uploadedById: doc.uploadedById,
        createdAt: doc.createdAt.toISOString(),
        url,
      };
    })
  );

  return {
    data: documentsWithUrls,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    query: {
      q,
      filters: {
        type: typeFilters,
        folderId,
        recursive,
        dateRange: from || to ? { from, to } : undefined,
      },
    },
  };
}
