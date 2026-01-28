import { Request, Response, NextFunction } from 'express';
import * as favoritesService from './favorites.service.js';

// GET /api/favorites - Get all favorites for current user
export async function getFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const favorites = await favoritesService.getFavorites(userId);
    const count = await favoritesService.getFavoritesCount(userId);

    res.json({
      favorites,
      count,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/favorites/count - Get favorites count
export async function getFavoritesCount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const count = await favoritesService.getFavoritesCount(userId);

    res.json({ count });
  } catch (error) {
    next(error);
  }
}

// POST /api/favorites - Add a favorite
export async function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { documentId, folderId } = req.body;

    if (!documentId && !folderId) {
      return res.status(400).json({ error: 'documentId ou folderId requis' });
    }

    if (documentId && folderId) {
      return res.status(400).json({ error: 'Fournir documentId OU folderId, pas les deux' });
    }

    let favorite;
    if (documentId) {
      favorite = await favoritesService.addDocumentFavorite(userId, documentId);
    } else {
      favorite = await favoritesService.addFolderFavorite(userId, folderId);
    }

    res.status(201).json(favorite);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

// DELETE /api/favorites/:id - Remove a favorite by ID
export async function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    await favoritesService.removeFavorite(userId, id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

// DELETE /api/favorites/document/:documentId - Remove document from favorites
export async function removeDocumentFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const documentId = req.params.documentId as string;

    await favoritesService.removeDocumentFavorite(userId, documentId);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

// DELETE /api/favorites/folder/:folderId - Remove folder from favorites
export async function removeFolderFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const folderId = req.params.folderId as string;

    await favoritesService.removeFolderFavorite(userId, folderId);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

// GET /api/favorites/check/document/:documentId - Check if document is favorite
export async function checkDocumentFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const documentId = req.params.documentId as string;

    const isFavorite = await favoritesService.isDocumentFavorite(userId, documentId);

    res.json({ isFavorite });
  } catch (error) {
    next(error);
  }
}

// GET /api/favorites/check/folder/:folderId - Check if folder is favorite
export async function checkFolderFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const folderId = req.params.folderId as string;

    const isFavorite = await favoritesService.isFolderFavorite(userId, folderId);

    res.json({ isFavorite });
  } catch (error) {
    next(error);
  }
}

// GET /api/favorites/recent - Get recent documents
export async function getRecentDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const documents = await favoritesService.getRecentDocuments(userId, Math.min(limit, 50));

    res.json({ documents });
  } catch (error) {
    next(error);
  }
}

// GET /api/favorites/quick-access - Get most accessed documents (for dashboard widget)
export async function getQuickAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 5;
    const days = parseInt(req.query.days as string) || 30;

    const documents = await favoritesService.getMostAccessedDocuments(userId, days, Math.min(limit, 10));

    res.json({ documents });
  } catch (error) {
    next(error);
  }
}
