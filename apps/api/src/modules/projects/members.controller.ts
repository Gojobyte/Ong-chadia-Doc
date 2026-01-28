import type { Request, Response, NextFunction } from 'express';
import * as membersService from './members.service.js';

/**
 * GET /api/projects/:id/members
 * Get all members of a project
 */
export async function getProjectMembers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const result = await membersService.getProjectMembers(projectId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/projects/:id/members
 * Add a member to a project
 */
export async function addMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const assignedById = req.user!.id;
    const member = await membersService.addMember(projectId, req.body, assignedById);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/projects/:id/members/:memberId
 * Update a member's role
 */
export async function updateMemberRole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const memberId = req.params.memberId as string;
    const { role } = req.body;
    const member = await membersService.updateMemberRole(projectId, memberId, role);
    res.json(member);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/projects/:id/members/:memberId
 * Remove a member from a project
 */
export async function removeMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.id as string;
    const memberId = req.params.memberId as string;
    await membersService.removeMember(projectId, memberId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
