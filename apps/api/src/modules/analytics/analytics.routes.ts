import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isStaffOrAbove } from '../../middleware/rbac.middleware.js';
import * as analyticsController from './analytics.controller.js';

const router: RouterType = Router();

// All analytics routes require authentication and Staff/Admin role
router.use(authenticate);
router.use(isStaffOrAbove);

// GET /api/analytics/storage - Storage usage
router.get('/storage', analyticsController.getStorageAnalytics);

// GET /api/analytics/uploads - Upload history by day
router.get('/uploads', analyticsController.getUploadAnalytics);

// GET /api/analytics/types - Document type distribution
router.get('/types', analyticsController.getTypeAnalytics);

// GET /api/analytics/folders - Top folders by document count
router.get('/folders', analyticsController.getFolderAnalytics);

// GET /api/analytics/users - Top uploaders
router.get('/users', analyticsController.getUserAnalytics);

export default router;
