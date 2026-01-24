import { z } from 'zod';

export const PermissionEnum = z.enum(['READ', 'WRITE', 'ADMIN']);
export const RoleEnum = z.enum(['SUPER_ADMIN', 'STAFF', 'CONTRIBUTOR', 'GUEST']);

export const createFolderPermissionSchema = z.object({
  role: RoleEnum,
  permission: PermissionEnum,
});

export const permissionIdSchema = z.object({
  id: z.string().cuid('ID de dossier invalide'),
  permId: z.string().cuid('ID de permission invalide'),
});

export type CreateFolderPermissionInput = z.infer<typeof createFolderPermissionSchema>;
