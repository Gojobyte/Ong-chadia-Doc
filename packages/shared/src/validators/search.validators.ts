import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(), // Comma-separated types: pdf,docx
  folderId: z.string().cuid().optional(),
  recursive: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  from: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Date invalide'),
  to: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Date invalide'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
