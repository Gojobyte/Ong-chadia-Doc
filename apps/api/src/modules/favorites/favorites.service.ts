import { prisma } from '../../config/database.js';

export interface FavoriteItem {
  id: string;
  type: 'document' | 'folder';
  document?: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    createdAt: Date;
  };
  folder?: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export async function getFavorites(userId: string): Promise<FavoriteItem[]> {
  const favorites = await prisma.userFavorite.findMany({
    where: { userId },
    include: {
      document: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((fav) => ({
    id: fav.id,
    type: fav.documentId ? 'document' : 'folder',
    document: fav.document || undefined,
    folder: fav.folder || undefined,
    createdAt: fav.createdAt,
  }));
}

export async function getFavoritesCount(userId: string): Promise<number> {
  return prisma.userFavorite.count({
    where: { userId },
  });
}

export async function addDocumentFavorite(userId: string, documentId: string) {
  // Check if document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document non trouvé');
  }

  // Check if already favorited
  const existing = await prisma.userFavorite.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.userFavorite.create({
    data: {
      userId,
      documentId,
    },
    include: {
      document: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function addFolderFavorite(userId: string, folderId: string) {
  // Check if folder exists
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  if (!folder) {
    throw new Error('Dossier non trouvé');
  }

  // Check if already favorited
  const existing = await prisma.userFavorite.findUnique({
    where: {
      userId_folderId: {
        userId,
        folderId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.userFavorite.create({
    data: {
      userId,
      folderId,
    },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function removeFavorite(userId: string, favoriteId: string) {
  const favorite = await prisma.userFavorite.findFirst({
    where: {
      id: favoriteId,
      userId,
    },
  });

  if (!favorite) {
    throw new Error('Favori non trouvé');
  }

  return prisma.userFavorite.delete({
    where: { id: favoriteId },
  });
}

export async function removeDocumentFavorite(userId: string, documentId: string) {
  const favorite = await prisma.userFavorite.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  if (!favorite) {
    throw new Error('Favori non trouvé');
  }

  return prisma.userFavorite.delete({
    where: { id: favorite.id },
  });
}

export async function removeFolderFavorite(userId: string, folderId: string) {
  const favorite = await prisma.userFavorite.findUnique({
    where: {
      userId_folderId: {
        userId,
        folderId,
      },
    },
  });

  if (!favorite) {
    throw new Error('Favori non trouvé');
  }

  return prisma.userFavorite.delete({
    where: { id: favorite.id },
  });
}

export async function isDocumentFavorite(userId: string, documentId: string): Promise<boolean> {
  const favorite = await prisma.userFavorite.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  return !!favorite;
}

export async function isFolderFavorite(userId: string, folderId: string): Promise<boolean> {
  const favorite = await prisma.userFavorite.findUnique({
    where: {
      userId_folderId: {
        userId,
        folderId,
      },
    },
  });

  return !!favorite;
}

export async function getRecentDocuments(userId: string, limit: number = 20) {
  // Get recent documents from access logs
  const accessLogs = await prisma.accessLog.findMany({
    where: {
      userId,
      action: 'VIEW',
    },
    select: {
      documentId: true,
      createdAt: true,
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
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 2, // Fetch more to handle duplicates
  });

  // Remove duplicates and keep most recent
  const seen = new Set<string>();
  const uniqueDocs = [];

  for (const log of accessLogs) {
    if (!seen.has(log.documentId) && log.document) {
      seen.add(log.documentId);
      uniqueDocs.push({
        ...log.document,
        lastAccessedAt: log.createdAt,
      });
      if (uniqueDocs.length >= limit) break;
    }
  }

  return uniqueDocs;
}

export async function getMostAccessedDocuments(userId: string, days: number = 30, limit: number = 5) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get document access counts
  const accessCounts = await prisma.accessLog.groupBy({
    by: ['documentId'],
    where: {
      userId,
      action: 'VIEW',
      createdAt: { gte: since },
    },
    _count: { documentId: true },
    orderBy: { _count: { documentId: 'desc' } },
    take: limit,
  });

  // Fetch document details
  const documentIds = accessCounts.map((a) => a.documentId);
  const documents = await prisma.document.findMany({
    where: { id: { in: documentIds } },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });

  // Combine with access counts - filter out documents that no longer exist
  return accessCounts
    .map((ac) => {
      const doc = documents.find((d) => d.id === ac.documentId);
      if (!doc) return null;
      return {
        ...doc,
        accessCount: ac._count.documentId,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);
}
