import { prisma } from '../../config/database.js';
import { cached, cacheKey, deleteCachePattern, CACHE_TTL } from '../../utils/cache.js';

export interface TagWithCount {
  id: string;
  name: string;
  color: string;
  createdById: string;
  createdAt: Date;
  _count: {
    documents: number;
  };
}

export async function getAllTags(): Promise<TagWithCount[]> {
  return cached(cacheKey.tags(), async () => {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: { documents: true },
        },
      },
      orderBy: [
        { documents: { _count: 'desc' } },
        { name: 'asc' },
      ],
    });
  }, CACHE_TTL.MEDIUM);
}

export async function searchTags(query: string, limit: number = 10): Promise<TagWithCount[]> {
  return prisma.tag.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: {
      _count: {
        select: { documents: true },
      },
    },
    orderBy: { documents: { _count: 'desc' } },
    take: limit,
  });
}

export async function getTagById(id: string) {
  return prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });
}

export async function createTag(name: string, color: string, createdById: string) {
  // Check if tag already exists
  const existing = await prisma.tag.findUnique({
    where: { name: name.toLowerCase().trim() },
  });

  if (existing) {
    return existing;
  }

  const tag = await prisma.tag.create({
    data: {
      name: name.toLowerCase().trim(),
      color,
      createdById,
    },
  });

  // Invalidate tags cache
  await invalidateTagsCache();

  return tag;
}

export async function updateTag(id: string, data: { name?: string; color?: string }) {
  const updateData: { name?: string; color?: string } = {};

  if (data.name) {
    updateData.name = data.name.toLowerCase().trim();
  }
  if (data.color) {
    updateData.color = data.color;
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: updateData,
  });

  // Invalidate tags cache
  await invalidateTagsCache();

  return tag;
}

export async function deleteTag(id: string) {
  const tag = await prisma.tag.delete({
    where: { id },
  });

  // Invalidate tags cache
  await invalidateTagsCache();

  return tag;
}

/**
 * Invalidate all tags-related caches
 */
async function invalidateTagsCache(): Promise<void> {
  await deleteCachePattern('tags:*');
}

export async function mergeTags(sourceTagId: string, targetTagId: string) {
  // Get all documents with source tag
  const documentsWithSource = await prisma.documentTag.findMany({
    where: { tagId: sourceTagId },
  });

  // For each document, add target tag if not present
  for (const docTag of documentsWithSource) {
    await prisma.documentTag.upsert({
      where: {
        documentId_tagId: {
          documentId: docTag.documentId,
          tagId: targetTagId,
        },
      },
      create: {
        documentId: docTag.documentId,
        tagId: targetTagId,
      },
      update: {},
    });
  }

  // Delete source tag (cascade will remove document associations)
  await prisma.tag.delete({
    where: { id: sourceTagId },
  });

  return getTagById(targetTagId);
}

// Document tag operations
export async function getDocumentTags(documentId: string) {
  const documentTags = await prisma.documentTag.findMany({
    where: { documentId },
    include: {
      tag: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return documentTags.map((dt) => dt.tag);
}

export async function addTagToDocument(documentId: string, tagId: string) {
  return prisma.documentTag.upsert({
    where: {
      documentId_tagId: {
        documentId,
        tagId,
      },
    },
    create: {
      documentId,
      tagId,
    },
    update: {},
    include: {
      tag: true,
    },
  });
}

export async function addTagsToDocument(documentId: string, tagIds: string[]) {
  const results = await Promise.all(
    tagIds.map((tagId) => addTagToDocument(documentId, tagId))
  );
  return results.map((r) => r.tag);
}

export async function removeTagFromDocument(documentId: string, tagId: string) {
  return prisma.documentTag.delete({
    where: {
      documentId_tagId: {
        documentId,
        tagId,
      },
    },
  });
}

export async function setDocumentTags(documentId: string, tagIds: string[]) {
  // Remove all existing tags
  await prisma.documentTag.deleteMany({
    where: { documentId },
  });

  // Add new tags
  if (tagIds.length > 0) {
    await prisma.documentTag.createMany({
      data: tagIds.map((tagId) => ({
        documentId,
        tagId,
      })),
    });
  }

  return getDocumentTags(documentId);
}

// Create tag if not exists and add to document
export async function addOrCreateTag(
  documentId: string,
  tagName: string,
  color: string,
  createdById: string
) {
  // Create or get existing tag
  const tag = await createTag(tagName, color, createdById);

  // Add to document
  await addTagToDocument(documentId, tag.id);

  return tag;
}

export async function getPopularTags(limit: number = 10): Promise<TagWithCount[]> {
  return cached(cacheKey.popularTags(limit), async () => {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { documents: { _count: 'desc' } },
      take: limit,
    });
  }, CACHE_TTL.MEDIUM);
}
