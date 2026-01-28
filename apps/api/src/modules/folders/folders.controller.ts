import type { Request, Response, NextFunction } from 'express';
import * as foldersService from './folders.service.js';

/**
 * GET /api/folders - Get root folders
 */
export async function getRootFolders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const result = await foldersService.getRootFolders(req.user!.id, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/folders/:id - Get folder by ID with children
 */
export async function getFolderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const folder = await foldersService.getFolderById(id);
    res.json({ data: folder });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/folders/:id/children - Get direct children of a folder
 */
export async function getFolderChildren(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const result = await foldersService.getFolderChildren(id, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/folders - Create a new folder
 */
export async function createFolder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const folder = await foldersService.createFolder(req.body, req.user!.id);
    res.status(201).json({ data: folder });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/folders/:id - Update a folder
 */
export async function updateFolder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const folder = await foldersService.updateFolder(id, req.body);
    res.json({ data: folder });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/folders/:id - Delete a folder
 */
export async function deleteFolder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    await foldersService.deleteFolder(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/folders/:id/path - Get full path from root to folder (single query)
 */
export async function getFolderPath(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const path = await foldersService.getFolderPath(id);
    res.json({ data: path });
  } catch (error) {
    next(error);
  }
}
