import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  folderId: z.string().cuid('ID de dossier invalide'),
});

export const documentIdSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
