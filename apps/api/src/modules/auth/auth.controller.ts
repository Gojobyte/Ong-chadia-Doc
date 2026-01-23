import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validators.js';
import { BadRequestError } from '../../common/errors.js';
import type { ZodError } from 'zod';

function formatZodError(error: ZodError): string {
  return error.issues.map((e: { message: string }) => e.message).join(', ');
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(formatZodError(parsed.error));
      }

      const user = await authService.register(parsed.data);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(formatZodError(parsed.error));
      }

      const result = await authService.login(parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(formatZodError(parsed.error));
      }

      const result = await authService.refresh(parsed.data.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
        throw new BadRequestError('Refresh token is required');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      await authService.logout(userId, refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      const user = await authService.me(userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },
};
