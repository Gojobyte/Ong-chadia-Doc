import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  folderId: z.string().cuid('ID de dossier invalide'),
});

export const documentIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1, 'Le nom ne peut pas être vide').max(255, 'Le nom est trop long').optional(),
  folderId: z.string().cuid('ID de dossier invalide').optional(),
}).refine(data => data.name !== undefined || data.folderId !== undefined, {
  message: 'Au moins un champ doit être fourni (name ou folderId)',
});

export const documentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sort: z.enum(['name', 'createdAt', 'size']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;
