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
  sizeMin?: number;
  sizeMax?: number;
  tags?: string[];
  uploadedBy?: string;
  sort?: 'relevance' | 'createdAt' | 'name' | 'size';
  order?: 'asc' | 'desc';
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
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  url?: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
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
 * Uses recursive CTE for O(1) query instead of N+1
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

  if (folderIds.length === 0) {
    return [];
  }

  // Use recursive CTE to get all descendants in a single query
  const allAccessibleFolders = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH RECURSIVE folder_tree AS (
      -- Base case: folders with explicit permissions
      SELECT id, parent_id FROM folders WHERE id = ANY(${folderIds}::text[])

      UNION

      -- Recursive case: get all descendants
      SELECT f.id, f.parent_id
      FROM folders f
      INNER JOIN folder_tree ft ON f.parent_id = ft.id
    )
    SELECT DISTINCT id FROM folder_tree
  `;

  return allAccessibleFolders.map((f) => f.id);
}

/**
 * Get all descendant folder IDs using recursive CTE (single query)
 */
async function getDescendantFolderIds(folderId: string): Promise<string[]> {
  const descendants = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH RECURSIVE folder_tree AS (
      -- Base case: start with the target folder
      SELECT id FROM folders WHERE id = ${folderId}

      UNION ALL

      -- Recursive case: get all children
      SELECT f.id
      FROM folders f
      INNER JOIN folder_tree ft ON f.parent_id = ft.id
    )
    SELECT id FROM folder_tree
  `;

  return descendants.map((d) => d.id);
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
    sizeMin,
    sizeMax,
    tags,
    uploadedBy,
    sort = 'createdAt',
    order = 'desc',
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

  // Filter by size range
  if (sizeMin !== undefined || sizeMax !== undefined) {
    where.size = {};
    if (sizeMin !== undefined) {
      where.size.gte = sizeMin;
    }
    if (sizeMax !== undefined) {
      where.size.lte = sizeMax;
    }
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    where.tags = {
      some: {
        tagId: { in: tags },
      },
    };
  }

  // Filter by uploader
  if (uploadedBy) {
    where.uploadedById = uploadedBy;
  }

  // Build orderBy
  const orderBy: Prisma.DocumentOrderByWithRelationInput = {};
  if (sort === 'name') {
    orderBy.name = order;
  } else if (sort === 'size') {
    orderBy.size = order;
  } else {
    orderBy.createdAt = order;
  }

  // Execute paginated query
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        folder: { select: { name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, color: true } },
          },
        },
        currentVersion: true, // Include current version for URL
      },
    }),
    prisma.document.count({ where }),
  ]);

  // Get signed URLs for all documents (using current version if available)
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      let url: string | undefined;
      try {
        // Use current version's storage path if available
        const storagePath = doc.currentVersion?.storagePath ?? doc.storagePath;
        url = await storageService.getSignedUrl(storagePath);
      } catch {
        // If storage service fails, continue without URL
        url = undefined;
      }
      return {
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        size: doc.size,
        folderId: doc.folderId,
        folderName: doc.folder?.name || 'Dossier inconnu',
        uploadedById: doc.uploadedById,
        uploadedBy: doc.uploadedBy,
        createdAt: doc.createdAt.toISOString(),
        url,
        tags: doc.tags.map((dt) => dt.tag),
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
