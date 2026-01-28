import { prisma } from '../../config/database.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors.js';
import { cached, cacheKey, deleteCache, deleteCachePattern, CACHE_TTL } from '../../utils/cache.js';

// Types for Folder operations
export interface CreateFolderDto {
  name: string;
  parentId?: string | null;
}

export interface UpdateFolderDto {
  name?: string;
  parentId?: string | null;
}

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

/**
 * Get all root folders (parentId = null) for a user
 */
export async function getRootFolders(userId: string, page = 1, limit = 50): Promise<{
  data: FolderResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const key = `${cacheKey.folders(null)}:${page}:${limit}`;

  return cached(key, async () => {
    const skip = (page - 1) * limit;

    const [folders, total] = await Promise.all([
      prisma.folder.findMany({
        where: { parentId: null },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { children: true } },
        },
      }),
      prisma.folder.count({ where: { parentId: null } }),
    ]);

    return {
      data: folders.map(mapFolderToResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }, CACHE_TTL.MEDIUM);
}

/**
 * Get a folder by ID with its direct children
 */
export async function getFolderById(id: string): Promise<FolderResponse> {
  return cached(cacheKey.folder(id), async () => {
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { children: true } },
          },
        },
        _count: { select: { children: true } },
      },
    });

    if (!folder) {
      throw new NotFoundError('Dossier non trouvé');
    }

    return mapFolderToResponse(folder);
  }, CACHE_TTL.MEDIUM);
}

/**
 * Get direct children of a folder
 */
export async function getFolderChildren(folderId: string, page = 1, limit = 50): Promise<{
  data: FolderResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const key = `${cacheKey.folders(folderId)}:${page}:${limit}`;

  return cached(key, async () => {
    // Verify folder exists
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) {
      throw new NotFoundError('Dossier parent non trouvé');
    }

    const skip = (page - 1) * limit;

    const [children, total] = await Promise.all([
      prisma.folder.findMany({
        where: { parentId: folderId },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { children: true } },
        },
      }),
      prisma.folder.count({ where: { parentId: folderId } }),
    ]);

    return {
      data: children.map(mapFolderToResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }, CACHE_TTL.MEDIUM);
}

/**
 * Create a new folder
 */
export async function createFolder(data: CreateFolderDto, userId: string): Promise<FolderResponse> {
  // If parentId is provided, verify it exists
  if (data.parentId) {
    const parentExists = await prisma.folder.findUnique({ where: { id: data.parentId } });
    if (!parentExists) {
      throw new NotFoundError('Dossier parent non trouvé');
    }
  }

  // Check for duplicate name in same parent
  const existingFolder = await prisma.folder.findFirst({
    where: {
      name: data.name,
      parentId: data.parentId ?? null,
    },
  });

  if (existingFolder) {
    throw new ConflictError('Un dossier avec ce nom existe déjà dans ce répertoire');
  }

  const folder = await prisma.folder.create({
    data: {
      name: data.name,
      parentId: data.parentId ?? null,
      createdById: userId,
    },
    include: {
      _count: { select: { children: true } },
    },
  });

  // Invalidate folder cache
  await invalidateFolderCache(data.parentId ?? null);

  return mapFolderToResponse(folder);
}

/**
 * Update a folder (rename or move)
 */
export async function updateFolder(id: string, data: UpdateFolderDto): Promise<FolderResponse> {
  const folder = await prisma.folder.findUnique({ where: { id } });
  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  const oldParentId = folder.parentId;

  // If moving to a new parent, check for cycles and parent existence
  if (data.parentId !== undefined && data.parentId !== folder.parentId) {
    if (data.parentId !== null) {
      const parentExists = await prisma.folder.findUnique({ where: { id: data.parentId } });
      if (!parentExists) {
        throw new NotFoundError('Dossier de destination non trouvé');
      }

      // Check for cycles
      const hasCycle = await checkCycleDetection(id, data.parentId);
      if (hasCycle) {
        throw new BadRequestError('Impossible de déplacer un dossier dans un de ses sous-dossiers');
      }
    }
  }

  // Check for duplicate name in target parent
  const targetParentId = data.parentId !== undefined ? data.parentId : folder.parentId;
  const targetName = data.name ?? folder.name;

  const existingFolder = await prisma.folder.findFirst({
    where: {
      name: targetName,
      parentId: targetParentId,
      id: { not: id },
    },
  });

  if (existingFolder) {
    throw new ConflictError('Un dossier avec ce nom existe déjà dans ce répertoire');
  }

  const updatedFolder = await prisma.folder.update({
    where: { id },
    data: {
      name: data.name,
      parentId: data.parentId,
    },
    include: {
      _count: { select: { children: true } },
    },
  });

  // Invalidate folder cache
  await deleteCache(cacheKey.folder(id));
  await invalidateFolderCache(oldParentId);
  if (data.parentId !== undefined && data.parentId !== oldParentId) {
    await invalidateFolderCache(data.parentId);
  }

  return mapFolderToResponse(updatedFolder);
}

/**
 * Delete a folder (only if empty)
 */
export async function deleteFolder(id: string): Promise<void> {
  const folder = await prisma.folder.findUnique({
    where: { id },
    include: {
      _count: { select: { children: true } },
    },
  });

  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  // Check if folder has children
  if (folder._count.children > 0) {
    throw new BadRequestError('Impossible de supprimer un dossier contenant des sous-dossiers');
  }

  // Note: Document check will be added in Story 2.3

  await prisma.folder.delete({ where: { id } });

  // Invalidate folder cache
  await deleteCache(cacheKey.folder(id));
  await invalidateFolderCache(folder.parentId);
}

/**
 * Check if moving a folder would create a cycle
 */
export async function checkCycleDetection(folderId: string, newParentId: string): Promise<boolean> {
  let currentId: string | null = newParentId;

  while (currentId) {
    if (currentId === folderId) {
      return true; // Cycle detected
    }

    const parent: { parentId: string | null } | null = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    currentId = parent?.parentId ?? null;
  }

  return false;
}

/**
 * Get the full path from root to a folder using recursive CTE (single query)
 * This replaces the N+1 query pattern in the frontend
 */
export async function getFolderPath(folderId: string): Promise<FolderResponse[]> {
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  // Use recursive CTE to get all ancestors in a single query
  const pathFolders = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    parent_id: string | null;
    created_by_id: string;
    created_at: Date;
    updated_at: Date;
    depth: number;
  }>>`
    WITH RECURSIVE folder_path AS (
      -- Base case: start with the target folder
      SELECT
        f.id,
        f.name,
        f.parent_id,
        f.created_by_id,
        f.created_at,
        f.updated_at,
        0 as depth
      FROM folders f
      WHERE f.id = ${folderId}

      UNION ALL

      -- Recursive case: get parent folders
      SELECT
        parent.id,
        parent.name,
        parent.parent_id,
        parent.created_by_id,
        parent.created_at,
        parent.updated_at,
        fp.depth + 1 as depth
      FROM folders parent
      INNER JOIN folder_path fp ON parent.id = fp.parent_id
    )
    SELECT * FROM folder_path
    ORDER BY depth DESC
  `;

  return pathFolders.map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.parent_id,
    createdById: f.created_by_id,
    createdAt: f.created_at.toISOString(),
    updatedAt: f.updated_at.toISOString(),
  }));
}

/**
 * Get all descendant folder IDs using recursive CTE (single query)
 * Replaces the N+1 recursive function
 */
export async function getDescendantFolderIds(folderId: string): Promise<string[]> {
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
 * Check cycle detection using recursive CTE (single query)
 * Replaces the N+1 while loop
 */
export async function checkCycleDetectionOptimized(folderId: string, newParentId: string): Promise<boolean> {
  const ancestors = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH RECURSIVE ancestor_path AS (
      -- Base case: start with the new parent
      SELECT id, parent_id FROM folders WHERE id = ${newParentId}

      UNION ALL

      -- Recursive case: get ancestors
      SELECT f.id, f.parent_id
      FROM folders f
      INNER JOIN ancestor_path ap ON f.id = ap.parent_id
    )
    SELECT id FROM ancestor_path WHERE id = ${folderId}
  `;

  return ancestors.length > 0;
}

/**
 * Invalidate folder cache for a parent folder and its children list
 */
async function invalidateFolderCache(parentId: string | null): Promise<void> {
  // Delete the parent folder cache
  if (parentId) {
    await deleteCache(cacheKey.folder(parentId));
  }
  // Delete the children list cache (using pattern to match all pagination variants)
  await deleteCachePattern(`${cacheKey.folders(parentId)}:*`);
}

/**
 * Map Prisma folder to response format
 */
function mapFolderToResponse(folder: {
  id: string;
  name: string;
  parentId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  children?: Array<{
    id: string;
    name: string;
    parentId: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: { children: number };
  }>;
  _count?: { children: number };
}): FolderResponse {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    createdById: folder.createdById,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
    children: folder.children?.map(mapFolderToResponse),
    _count: folder._count,
  };
}
