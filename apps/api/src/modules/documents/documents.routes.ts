import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams, validate } from '../../middleware/validate.middleware.js';
import { canAccessDocument, canMoveDocument } from '../../middleware/document-access.middleware.js';
import { isSuperAdmin, isStaffOrAbove } from '../../middleware/rbac.middleware.js';
import { UnsupportedFileTypeError } from '../../common/errors.js';
import * as documentsController from './documents.controller.js';
import * as versionsController from './versions.controller.js';
import * as searchController from './search.controller.js';
import * as sharingController from './sharing.controller.js';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './documents.service.js';
import { z } from 'zod';

const router: RouterType = Router();

// Zod schemas for validation
const documentIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
});

const versionIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
  versionId: z.string().cuid('ID de version invalide'),
});

const updateDocumentSchema = z.object({
  name: z.string().min(1, 'Le nom ne peut pas être vide').max(255).optional(),
  folderId: z.string().cuid('ID de dossier invalide').optional(),
}).refine(data => data.name || data.folderId, {
  message: 'Au moins un champ doit être fourni (name ou folderId)',
});

const shareLinkIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
  linkId: z.string().cuid('ID de lien invalide'),
});

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_MIME_TYPES[number])) {
      cb(null, true);
    } else {
      cb(new UnsupportedFileTypeError(file.mimetype));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// GET /api/documents/search - Search documents (must be before :id routes)
router.get('/search', searchController.searchDocuments);

// POST /api/documents/upload - Upload a document
router.post(
  '/upload',
  upload.single('file'),
  documentsController.uploadDocument
);

// GET /api/documents/:id - Get document by ID
router.get(
  '/:id',
  validateParams(documentIdSchema),
  canAccessDocument('READ'),
  documentsController.getDocumentById
);

// GET /api/documents/:id/download - Get download URL
router.get(
  '/:id/download',
  validateParams(documentIdSchema),
  canAccessDocument('READ'),
  documentsController.getDownloadUrl
);

// PATCH /api/documents/:id - Update document (rename or move)
router.patch(
  '/:id',
  validateParams(documentIdSchema),
  validate(updateDocumentSchema),
  canAccessDocument('WRITE'),
  canMoveDocument(),
  documentsController.updateDocument
);

// DELETE /api/documents/:id - Delete a document
router.delete(
  '/:id',
  validateParams(documentIdSchema),
  canAccessDocument('WRITE'),
  documentsController.deleteDocument
);

// =====================
// VERSION ROUTES
// =====================

// POST /api/documents/:id/versions - Upload a new version
router.post(
  '/:id/versions',
  validateParams(documentIdSchema),
  canAccessDocument('WRITE'),
  upload.single('file'),
  versionsController.uploadNewVersion
);

// GET /api/documents/:id/versions - Get all versions
router.get(
  '/:id/versions',
  validateParams(documentIdSchema),
  canAccessDocument('READ'),
  versionsController.getVersions
);

// GET /api/documents/:id/versions/:versionId/download - Download a specific version
router.get(
  '/:id/versions/:versionId/download',
  validateParams(versionIdSchema),
  canAccessDocument('READ'),
  versionsController.getVersionDownloadUrl
);

// POST /api/documents/:id/versions/:versionId/restore - Restore a version
router.post(
  '/:id/versions/:versionId/restore',
  validateParams(versionIdSchema),
  canAccessDocument('WRITE'),
  versionsController.restoreVersion
);

// =====================
// SHARING ROUTES
// =====================

// POST /api/documents/:id/share - Create a share link (Staff or Super-Admin)
router.post(
  '/:id/share',
  validateParams(documentIdSchema),
  isStaffOrAbove,
  canAccessDocument('WRITE'),
  sharingController.createShareLink
);

// GET /api/documents/:id/share-links - Get all share links (Staff or Super-Admin)
router.get(
  '/:id/share-links',
  validateParams(documentIdSchema),
  isStaffOrAbove,
  canAccessDocument('READ'),
  sharingController.getShareLinks
);

// DELETE /api/documents/:id/share/:linkId - Revoke a share link (Staff or Super-Admin)
router.delete(
  '/:id/share/:linkId',
  validateParams(shareLinkIdSchema),
  isStaffOrAbove,
  canAccessDocument('WRITE'),
  sharingController.revokeShareLink
);

// =====================
// ACCESS LOGS ROUTES
// =====================

// GET /api/documents/:id/access-logs - Get access logs (Super-Admin only)
router.get(
  '/:id/access-logs',
  validateParams(documentIdSchema),
  isSuperAdmin,
  canAccessDocument('READ'),
  sharingController.getAccessLogs
);

export default router;
