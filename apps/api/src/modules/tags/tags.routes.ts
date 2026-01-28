import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams } from '../../middleware/validate.middleware.js';
import { isSuperAdmin } from '../../middleware/rbac.middleware.js';
import * as tagsController from './tags.controller.js';
import { z } from 'zod';

const router: RouterType = Router();

// Validation schemas
const tagIdSchema = z.object({
  id: z.string().cuid('ID de tag invalide'),
});

const tagIdAndDocIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
  tagId: z.string().cuid('ID de tag invalide'),
});

// All routes require authentication
router.use(authenticate);

// GET /api/tags - Get all tags
router.get('/', tagsController.getAllTags);

// GET /api/tags/search - Search tags (autocomplete)
router.get('/search', tagsController.searchTags);

// GET /api/tags/popular - Get popular tags
router.get('/popular', tagsController.getPopularTags);

// GET /api/tags/:id - Get tag by ID
router.get(
  '/:id',
  validateParams(tagIdSchema),
  tagsController.getTagById
);

// POST /api/tags - Create a tag
router.post('/', tagsController.createTag);

// PATCH /api/tags/:id - Update a tag
router.patch(
  '/:id',
  validateParams(tagIdSchema),
  tagsController.updateTag
);

// DELETE /api/tags/:id - Delete a tag (Admin only)
router.delete(
  '/:id',
  validateParams(tagIdSchema),
  isSuperAdmin,
  tagsController.deleteTag
);

// POST /api/tags/merge - Merge tags (Admin only)
router.post('/merge', isSuperAdmin, tagsController.mergeTags);

export default router;
