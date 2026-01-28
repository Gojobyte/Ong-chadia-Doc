import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service.js';
import type { Period } from './analytics.service.js';

// GET /api/analytics/storage
export async function getStorageAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getStorageAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

// GET /api/analytics/uploads
export async function getUploadAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as Period) || '30d';
    const data = await analyticsService.getUploadAnalytics(period);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

// GET /api/analytics/types
export async function getTypeAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getTypeAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

// GET /api/analytics/folders
export async function getFolderAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await analyticsService.getFolderAnalytics(limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

// GET /api/analytics/users
export async function getUserAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const period = (req.query.period as Period) || '30d';
    const data = await analyticsService.getUserAnalytics(limit, period);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
