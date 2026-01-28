import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import * as dashboardController from './dashboard.controller.js';

const router: RouterType = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * GET /api/dashboard
 * Get aggregated dashboard data
 */
router.get('/', dashboardController.getDashboard);

/**
 * GET /api/dashboard/activity
 * Get recent activity with pagination
 * Query params: page, limit
 */
router.get('/activity', dashboardController.getActivity);

export default router;
