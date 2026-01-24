import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate, validateParams } from '../../middleware/validate.middleware.js';
import { createFolderSchema, updateFolderSchema, folderIdSchema } from './folders.validators.js';
import * as foldersController from './folders.controller.js';

const router: RouterType = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/folders - Get root folders
router.get('/', foldersController.getRootFolders);

// GET /api/folders/:id - Get folder by ID with children
router.get('/:id', validateParams(folderIdSchema), foldersController.getFolderById);

// GET /api/folders/:id/children - Get direct children
router.get('/:id/children', validateParams(folderIdSchema), foldersController.getFolderChildren);

// POST /api/folders - Create a new folder
router.post('/', validate(createFolderSchema), foldersController.createFolder);

// PATCH /api/folders/:id - Update a folder
router.patch(
  '/:id',
  validateParams(folderIdSchema),
  validate(updateFolderSchema),
  foldersController.updateFolder
);

// DELETE /api/folders/:id - Delete a folder
router.delete('/:id', validateParams(folderIdSchema), foldersController.deleteFolder);

export default router;
