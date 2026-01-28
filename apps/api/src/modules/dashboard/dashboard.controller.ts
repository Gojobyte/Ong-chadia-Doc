import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service.js';

/**
 * GET /api/dashboard
 * Get aggregated dashboard data for the authenticated user
 */
export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await dashboardService.getDashboardData(userId, userRole);

    res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dashboard/activity
 * Get recent activity with pagination
 */
export async function getActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const data = await dashboardService.getActivityData(userId, userRole, page, limit);

    res.json(data);
  } catch (error) {
    next(error);
  }
}
