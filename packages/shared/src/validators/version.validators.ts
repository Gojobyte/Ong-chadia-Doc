import { z } from 'zod';

export const versionIdParamsSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
  versionId: z.string().cuid('ID de version invalide'),
});

export const documentIdParamsSchema = z.object({
  id: z.string().cuid('ID de document invalide'),
});

export type VersionIdParams = z.infer<typeof versionIdParamsSchema>;
export type DocumentIdParams = z.infer<typeof documentIdParamsSchema>;
