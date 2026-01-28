import type { Request, Response, NextFunction } from 'express';
import * as projectsService from './projects.service.js';

/**
 * POST /api/projects - Create a new project
 */
export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsService.createProject(req.body, req.user!.id);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/projects - Get all projects with pagination and filters
 */
export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await projectsService.getProjects({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sort: req.query.sort as string,
      order: req.query.order as string,
      status: req.query.status as string,
      search: req.query.search as string,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/projects/:id - Get a project by ID
 */
export async function getProjectById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsService.getProjectById(req.params.id as string);
    res.json(project);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/projects/:id - Update a project
 */
export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsService.updateProject(req.params.id as string, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/projects/:id - Soft delete a project
 */
export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await projectsService.deleteProject(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
