import type { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  idParamSchema,
} from './users.validators.js';
import { BadRequestError } from '../../common/errors.js';
import type { ZodError } from 'zod';

function formatZodError(error: ZodError): string {
  return error.issues.map(e => {
    const path = e.path.join('.');
    return path ? `${path}: ${e.message}` : e.message;
  }).join(', ');
}

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = listUsersQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new BadRequestError(formatZodError(parsed.error));
      }

      const result = await usersService.list(parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new BadRequestError(formatZodError(paramsParsed.error));
      }

      const user = await usersService.getById(paramsParsed.data.id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(formatZodError(parsed.error));
      }

      const user = await usersService.create(parsed.data);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new BadRequestError(formatZodError(paramsParsed.error));
      }

      const bodyParsed = updateUserSchema.safeParse(req.body);
      if (!bodyParsed.success) {
        throw new BadRequestError(formatZodError(bodyParsed.error));
      }

      const user = await usersService.update(paramsParsed.data.id, bodyParsed.data);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new BadRequestError(formatZodError(paramsParsed.error));
      }

      const currentUserId = req.user!.id;
      await usersService.delete(paramsParsed.data.id, currentUserId);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
