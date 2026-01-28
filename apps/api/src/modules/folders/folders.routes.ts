import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate, validateParams } from '../../middleware/validate.middleware.js';
import { isStaffOrAbove } from '../../middleware/rbac.middleware.js';
import { createFolderSchema, updateFolderSchema, folderIdSchema } from './folders.validators.js';
import { createFolderPermissionSchema, permissionIdSchema } from './permissions.validators.js';
import * as foldersController from './folders.controller.js';
import * as permissionsController from './permissions.controller.js';
import * as documentsController from '../documents/documents.controller.js';

const router: RouterType = Router();

// All routes require authentication
router.use(authenticate);

// =====================
// FOLDER ROUTES
// =====================

// GET /api/folders - Get root folders
router.get('/', foldersController.getRootFolders);

// GET /api/folders/:id - Get folder by ID with children
router.get('/:id', validateParams(folderIdSchema), foldersController.getFolderById);

// GET /api/folders/:id/path - Get full path from root to folder (optimized single query)
router.get('/:id/path', validateParams(folderIdSchema), foldersController.getFolderPath);

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

// =====================
// DOCUMENT ROUTES (within folder context)
// =====================

// GET /api/folders/:id/documents - Get documents in a folder
router.get(
  '/:id/documents',
  validateParams(folderIdSchema),
  documentsController.getDocumentsByFolder
);

// =====================
// PERMISSION ROUTES
// =====================

// GET /api/folders/:id/permissions - Get folder permissions (Staff+ or Folder Admin)
router.get(
  '/:id/permissions',
  validateParams(folderIdSchema),
  isStaffOrAbove,
  permissionsController.getFolderPermissions
);

// POST /api/folders/:id/permissions - Add permission (Staff+ or Folder Admin)
router.post(
  '/:id/permissions',
  validateParams(folderIdSchema),
  isStaffOrAbove,
  validate(createFolderPermissionSchema),
  permissionsController.addPermission
);

// DELETE /api/folders/:id/permissions/:permId - Remove permission (Staff+ or Folder Admin)
router.delete(
  '/:id/permissions/:permId',
  validateParams(permissionIdSchema),
  isStaffOrAbove,
  permissionsController.removePermission
);

export default router;
