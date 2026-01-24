import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du dossier est requis')
    .max(255, 'Le nom du dossier ne peut pas dépasser 255 caractères')
    .regex(/^[^<>:"/\\|?*]+$/, 'Le nom contient des caractères invalides'),
  parentId: z.string().cuid().nullable().optional(),
});

export const updateFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du dossier est requis')
    .max(255, 'Le nom du dossier ne peut pas dépasser 255 caractères')
    .regex(/^[^<>:"/\\|?*]+$/, 'Le nom contient des caractères invalides')
    .optional(),
  parentId: z.string().cuid().nullable().optional(),
});

export const folderIdSchema = z.object({
  id: z.string().cuid('ID de dossier invalide'),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
