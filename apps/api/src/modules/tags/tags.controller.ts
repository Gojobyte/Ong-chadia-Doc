import { Request, Response, NextFunction } from 'express';
import * as tagsService from './tags.service.js';

// GET /api/tags - Get all tags
export async function getAllTags(req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await tagsService.getAllTags();
    res.json({ tags });
  } catch (error) {
    next(error);
  }
}

// GET /api/tags/search - Search tags (autocomplete)
export async function searchTags(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    const tags = await tagsService.searchTags(query, limit);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
}

// GET /api/tags/popular - Get popular tags
export async function getPopularTags(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const tags = await tagsService.getPopularTags(limit);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
}

// GET /api/tags/:id - Get tag by ID
export async function getTagById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const tag = await tagsService.getTagById(id);

    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }

    res.json(tag);
  } catch (error) {
    next(error);
  }
}

// POST /api/tags - Create a tag
export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, color = '#6366f1' } = req.body;
    const userId = req.user!.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom du tag est requis' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Le nom du tag ne peut pas dépasser 50 caractères' });
    }

    // Validate color format
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: 'Format de couleur invalide (ex: #FF5733)' });
    }

    const tag = await tagsService.createTag(name, color, userId);
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/tags/:id - Update a tag
export async function updateTag(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, color } = req.body;

    if (name && name.length > 50) {
      return res.status(400).json({ error: 'Le nom du tag ne peut pas dépasser 50 caractères' });
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: 'Format de couleur invalide (ex: #FF5733)' });
    }

    const tag = await tagsService.updateTag(id, { name, color });
    res.json(tag);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/tags/:id - Delete a tag (Admin only)
export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await tagsService.deleteTag(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// POST /api/tags/merge - Merge tags (Admin only)
export async function mergeTags(req: Request, res: Response, next: NextFunction) {
  try {
    const { sourceTagId, targetTagId } = req.body;

    if (!sourceTagId || !targetTagId) {
      return res.status(400).json({ error: 'sourceTagId et targetTagId sont requis' });
    }

    if (sourceTagId === targetTagId) {
      return res.status(400).json({ error: 'Les tags source et cible doivent être différents' });
    }

    const tag = await tagsService.mergeTags(sourceTagId, targetTagId);
    res.json(tag);
  } catch (error) {
    next(error);
  }
}

// GET /api/documents/:id/tags - Get document tags
export async function getDocumentTags(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const tags = await tagsService.getDocumentTags(id);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
}

// POST /api/documents/:id/tags - Add tags to document
export async function addDocumentTags(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { tagIds, tagNames } = req.body;
    const userId = req.user!.id;

    const addedTags: any[] = [];

    // Add existing tags by ID
    if (tagIds && tagIds.length > 0) {
      const tags = await tagsService.addTagsToDocument(id, tagIds);
      addedTags.push(...tags);
    }

    // Create and add new tags by name
    if (tagNames && tagNames.length > 0) {
      for (const name of tagNames) {
        const tag = await tagsService.addOrCreateTag(id, name, '#6366f1', userId);
        addedTags.push(tag);
      }
    }

    res.status(201).json({ tags: addedTags });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/documents/:id/tags/:tagId - Remove tag from document
export async function removeDocumentTag(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const tagId = req.params.tagId as string;
    await tagsService.removeTagFromDocument(id, tagId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// PUT /api/documents/:id/tags - Set all document tags (replace)
export async function setDocumentTags(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { tagIds } = req.body;

    const tags = await tagsService.setDocumentTags(id, tagIds || []);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
}
