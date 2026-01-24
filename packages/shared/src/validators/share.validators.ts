import { z } from 'zod';
import { ExpirationDuration } from '../types/share.types';

export const createShareLinkSchema = z.object({
  expiresIn: z.nativeEnum(ExpirationDuration),
  maxAccessCount: z.number().int().positive().nullable().optional(),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
