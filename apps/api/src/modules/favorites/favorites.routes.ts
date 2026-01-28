import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams } from '../../middleware/validate.middleware.js';
import * as favoritesController from './favorites.controller.js';
import { z } from 'zod';

const router: RouterType = Router();

// Validation schemas
const favoriteIdSchema = z.object({
  id: z.string().cuid('ID de favori invalide'),
});

const documentIdSchema = z.object({
  documentId: z.string().cuid('ID de document invalide'),
});

const folderIdSchema = z.object({
  folderId: z.string().cuid('ID de dossier invalide'),
});

// All routes require authentication
router.use(authenticate);

// GET /api/favorites - Get all favorites
router.get('/', favoritesController.getFavorites);

// GET /api/favorites/count - Get favorites count
router.get('/count', favoritesController.getFavoritesCount);

// GET /api/favorites/recent - Get recent documents
router.get('/recent', favoritesController.getRecentDocuments);

// GET /api/favorites/quick-access - Get most accessed documents
router.get('/quick-access', favoritesController.getQuickAccess);

// GET /api/favorites/check/document/:documentId - Check if document is favorite
router.get(
  '/check/document/:documentId',
  validateParams(documentIdSchema),
  favoritesController.checkDocumentFavorite
);

// GET /api/favorites/check/folder/:folderId - Check if folder is favorite
router.get(
  '/check/folder/:folderId',
  validateParams(folderIdSchema),
  favoritesController.checkFolderFavorite
);

// POST /api/favorites - Add a favorite
router.post('/', favoritesController.addFavorite);

// DELETE /api/favorites/:id - Remove a favorite by ID
router.delete(
  '/:id',
  validateParams(favoriteIdSchema),
  favoritesController.removeFavorite
);

// DELETE /api/favorites/document/:documentId - Remove document from favorites
router.delete(
  '/document/:documentId',
  validateParams(documentIdSchema),
  favoritesController.removeDocumentFavorite
);

// DELETE /api/favorites/folder/:folderId - Remove folder from favorites
router.delete(
  '/folder/:folderId',
  validateParams(folderIdSchema),
  favoritesController.removeFolderFavorite
);

export default router;
