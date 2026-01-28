import { Router, type Router as RouterType, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams, validate, validateQuery } from '../../middleware/validate.middleware.js';
import { isStaffOrAbove, isSuperAdmin } from '../../middleware/rbac.middleware.js';
import { ForbiddenError } from '../../common/errors.js';
import * as projectsController from './projects.controller.js';
import * as projectsService from './projects.service.js';
import * as membersController from './members.controller.js';
import * as membersService from './members.service.js';
import * as projectDocumentsController from './project-documents.controller.js';
import * as projectDocumentsService from './project-documents.service.js';

const router: RouterType = Router();

// Zod schemas for validation
const projectIdSchema = z.object({
  id: z.string().uuid('ID de projet invalide'),
});

const createProjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z.string().max(5000, 'La description ne peut pas dépasser 5000 caractères').optional(),
  status: z.enum(['DRAFT', 'PREPARATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive('Le budget doit être positif').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate'],
  }
);

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Le nom ne peut pas être vide').max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(['DRAFT', 'PREPARATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  budget: z.number().positive('Le budget doit être positif').nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ doit être fourni' }
);

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  sort: z.enum(['name', 'createdAt', 'startDate', 'endDate', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Member schemas
const memberIdSchema = z.object({
  id: z.string().uuid('ID de projet invalide'),
  memberId: z.string().uuid('ID de membre invalide'),
});

const addMemberSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  role: z.enum(['PROJECT_MANAGER', 'MEMBER', 'VOLUNTEER'], {
    message: 'Rôle invalide. Valeurs acceptées: PROJECT_MANAGER, MEMBER, VOLUNTEER',
  }),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['PROJECT_MANAGER', 'MEMBER', 'VOLUNTEER'], {
    message: 'Rôle invalide. Valeurs acceptées: PROJECT_MANAGER, MEMBER, VOLUNTEER',
  }),
});

// Document schemas
const documentIdParamsSchema = z.object({
  id: z.string().uuid('ID de projet invalide'),
  docId: z.string().min(1, 'ID de document invalide'),
});

const folderIdParamsSchema = z.object({
  id: z.string().uuid('ID de projet invalide'),
  folderId: z.string().uuid('ID de dossier invalide'),
});

const linkDocumentSchema = z.object({
  documentId: z.string().min(1, 'ID de document requis'),
});

const linkFolderSchema = z.object({
  recursive: z.boolean().optional().default(false),
});

const documentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

/**
 * Middleware to check if user can update a project
 * Allows: Staff+, or PROJECT_MANAGER of the project
 */
function canUpdateProject() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const projectId = req.params.id as string;

      // Staff and Super-Admin can always update
      if (userRole === 'STAFF' || userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Check if user is PROJECT_MANAGER
      const isManager = await projectsService.isProjectManager(projectId, userId);
      if (isManager) {
        return next();
      }

      next(new ForbiddenError('Permissions insuffisantes pour modifier ce projet'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user can manage project members
 * Allows: Staff+, or PROJECT_MANAGER of the project
 */
function canManageMembers() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const projectId = req.params.id as string;

      // Staff and Super-Admin can always manage members
      if (userRole === 'STAFF' || userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Check if user is PROJECT_MANAGER of this project
      const memberRole = await membersService.getMemberRole(projectId, userId);
      if (memberRole === 'PROJECT_MANAGER') {
        return next();
      }

      next(new ForbiddenError('Permissions insuffisantes pour gérer les membres de ce projet'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user can manage project documents
 * Allows: Staff+, or any member of the project
 */
function canManageDocuments() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const projectId = req.params.id as string;

      // Staff and Super-Admin can always manage documents
      if (userRole === 'STAFF' || userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Check if user is a member of this project
      const isMember = await projectDocumentsService.isProjectMember(projectId, userId);
      if (isMember) {
        return next();
      }

      next(new ForbiddenError('Vous devez être membre du projet pour gérer ses documents'));
    } catch (error) {
      next(error);
    }
  };
}

// All routes require authentication
router.use(authenticate);

// GET /api/projects - List all projects (authenticated users)
router.get(
  '/',
  validateQuery(querySchema),
  projectsController.getProjects
);

// POST /api/projects - Create a project (Staff+ only)
router.post(
  '/',
  isStaffOrAbove,
  validate(createProjectSchema),
  projectsController.createProject
);

// GET /api/projects/:id - Get project details (authenticated users)
router.get(
  '/:id',
  validateParams(projectIdSchema),
  projectsController.getProjectById
);

// PATCH /api/projects/:id - Update project (Staff+ or PROJECT_MANAGER)
router.patch(
  '/:id',
  validateParams(projectIdSchema),
  validate(updateProjectSchema),
  canUpdateProject(),
  projectsController.updateProject
);

// DELETE /api/projects/:id - Soft delete project (Super-Admin only)
router.delete(
  '/:id',
  validateParams(projectIdSchema),
  isSuperAdmin,
  projectsController.deleteProject
);

// =====================
// PROJECT MEMBERS ROUTES
// =====================

// GET /api/projects/:id/members - List project members (authenticated users)
router.get(
  '/:id/members',
  validateParams(projectIdSchema),
  membersController.getProjectMembers
);

// POST /api/projects/:id/members - Add a member (Staff+ or PROJECT_MANAGER)
router.post(
  '/:id/members',
  validateParams(projectIdSchema),
  validate(addMemberSchema),
  canManageMembers(),
  membersController.addMember
);

// PATCH /api/projects/:id/members/:memberId - Update member role (Staff+ or PROJECT_MANAGER)
router.patch(
  '/:id/members/:memberId',
  validateParams(memberIdSchema),
  validate(updateMemberRoleSchema),
  canManageMembers(),
  membersController.updateMemberRole
);

// DELETE /api/projects/:id/members/:memberId - Remove a member (Staff+ or PROJECT_MANAGER)
router.delete(
  '/:id/members/:memberId',
  validateParams(memberIdSchema),
  canManageMembers(),
  membersController.removeMember
);

// =====================
// PROJECT DOCUMENTS ROUTES
// =====================

// GET /api/projects/:id/documents - List linked documents (authenticated users)
router.get(
  '/:id/documents',
  validateParams(projectIdSchema),
  validateQuery(documentsQuerySchema),
  projectDocumentsController.getLinkedDocuments
);

// POST /api/projects/:id/documents - Link a document (project member or Staff+)
router.post(
  '/:id/documents',
  validateParams(projectIdSchema),
  validate(linkDocumentSchema),
  canManageDocuments(),
  projectDocumentsController.linkDocument
);

// POST /api/projects/:id/documents/folder/:folderId - Link all documents from folder (project member or Staff+)
router.post(
  '/:id/documents/folder/:folderId',
  validateParams(folderIdParamsSchema),
  validate(linkFolderSchema),
  canManageDocuments(),
  projectDocumentsController.linkFolder
);

// DELETE /api/projects/:id/documents/:docId - Unlink a document (project member or Staff+)
router.delete(
  '/:id/documents/:docId',
  validateParams(documentIdParamsSchema),
  canManageDocuments(),
  projectDocumentsController.unlinkDocument
);

export default router;
