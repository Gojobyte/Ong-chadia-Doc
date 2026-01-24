import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams, validate } from '../../middleware/validate.middleware.js';
import { canAccessDocument, canMoveDocument } from '../../middleware/document-access.middleware.js';
import { UnsupportedFileTypeError } from '../../common/errors.js';
import * as documentsController from './documents.controller.js';
import * as versionsController from './versions.controller.js';
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

export default router;
