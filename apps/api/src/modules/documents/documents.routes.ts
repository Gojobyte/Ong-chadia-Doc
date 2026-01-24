import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams } from '../../middleware/validate.middleware.js';
import { UnsupportedFileTypeError } from '../../common/errors.js';
import * as documentsController from './documents.controller.js';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './documents.service.js';
import { z } from 'zod';

const router: RouterType = Router();

// Zod schemas for validation
const documentIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
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
  documentsController.getDocumentById
);

// DELETE /api/documents/:id - Delete a document
router.delete(
  '/:id',
  validateParams(documentIdSchema),
  documentsController.deleteDocument
);

export default router;
