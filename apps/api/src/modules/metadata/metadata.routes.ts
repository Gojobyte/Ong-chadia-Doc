import { Router, type Router as RouterType } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import * as metadataController from './metadata.controller.js';

const router: RouterType = Router();

// All routes require authentication
router.use(authenticate);

// ================
// METADATA TEMPLATES
// ================

// GET /api/metadata-templates - List all templates (optionally filter by folder)
router.get('/templates', metadataController.getTemplates);

// GET /api/metadata-templates/:id - Get a specific template
router.get('/templates/:id', metadataController.getTemplate);

// POST /api/metadata-templates - Create a template (Staff+)
router.post('/templates', requireRole('STAFF'), metadataController.createTemplate);

// PATCH /api/metadata-templates/:id - Update a template (Staff+)
router.patch('/templates/:id', requireRole('STAFF'), metadataController.updateTemplate);

// DELETE /api/metadata-templates/:id - Delete a template (Admin only)
router.delete('/templates/:id', requireRole('SUPER_ADMIN'), metadataController.deleteTemplate);

// ================
// DOCUMENT METADATA
// ================

// GET /api/metadata/documents/:documentId - Get document metadata
router.get('/documents/:documentId', metadataController.getDocumentMetadata);

// POST /api/metadata/documents/:documentId - Set document metadata
router.post('/documents/:documentId', metadataController.setDocumentMetadata);

// PATCH /api/metadata/documents/:documentId - Update document metadata values
router.patch('/documents/:documentId', metadataController.updateDocumentMetadata);

// DELETE /api/metadata/documents/:documentId - Remove document metadata
router.delete('/documents/:documentId', metadataController.deleteDocumentMetadata);

export default router;
