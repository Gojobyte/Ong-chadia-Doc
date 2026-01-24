import type { Permission as PermissionType, Role as RoleType } from '@prisma/client';
import pkg from '@prisma/client';
const { Permission, Role } = pkg;
import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';

// Types for permission operations
export interface CreateFolderPermissionDto {
  role: RoleType;
  permission: PermissionType;
}

export interface FolderPermissionResponse {
  id: string;
  folderId: string;
  role: RoleType;
  permission: PermissionType;
  createdAt: string;
}

export interface EffectivePermission {
  permission: PermissionType | null;
  inherited: boolean;
  sourceId: string | null;
}

/**
 * Permission hierarchy: ADMIN > WRITE > READ
 */
const PERMISSION_HIERARCHY: Record<PermissionType, number> = {
  [Permission.READ]: 1,
  [Permission.WRITE]: 2,
  [Permission.ADMIN]: 3,
};

/**
 * Check if a permission level is sufficient for the required level
 */
function hasRequiredPermission(
  actual: PermissionType,
  required: PermissionType
): boolean {
  return PERMISSION_HIERARCHY[actual] >= PERMISSION_HIERARCHY[required];
}

/**
 * Get all direct permissions for a folder
 */
export async function getFolderPermissions(
  folderId: string
): Promise<FolderPermissionResponse[]> {
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  const permissions = await prisma.folderPermission.findMany({
    where: { folderId },
    orderBy: { role: 'asc' },
  });

  return permissions.map(mapPermissionToResponse);
}

/**
 * Get effective permission for a role on a folder (with inheritance)
 */
export async function getEffectivePermission(
  folderId: string,
  role: RoleType
): Promise<EffectivePermission> {
  // Super Admin always has ADMIN permission
  if (role === Role.SUPER_ADMIN) {
    return {
      permission: Permission.ADMIN,
      inherited: false,
      sourceId: null,
    };
  }

  // Check direct permission on this folder
  const directPermission = await prisma.folderPermission.findUnique({
    where: { folderId_role: { folderId, role } },
  });

  if (directPermission) {
    return {
      permission: directPermission.permission,
      inherited: false,
      sourceId: folderId,
    };
  }

  // Check parent folder (inheritance)
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: { parentId: true },
  });

  if (folder?.parentId) {
    const parentEffective = await getEffectivePermission(folder.parentId, role);
    if (parentEffective.permission) {
      return {
        permission: parentEffective.permission,
        inherited: true,
        sourceId: parentEffective.sourceId,
      };
    }
  }

  // No permission found
  return {
    permission: null,
    inherited: false,
    sourceId: null,
  };
}

/**
 * Add a permission to a folder
 */
export async function addPermission(
  folderId: string,
  data: CreateFolderPermissionDto
): Promise<FolderPermissionResponse> {
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) {
    throw new NotFoundError('Dossier non trouvé');
  }

  // Use upsert to handle existing permission (update) or create new
  const permission = await prisma.folderPermission.upsert({
    where: { folderId_role: { folderId, role: data.role } },
    update: { permission: data.permission },
    create: {
      folderId,
      role: data.role,
      permission: data.permission,
    },
  });

  return mapPermissionToResponse(permission);
}

/**
 * Remove a permission from a folder
 */
export async function removePermission(permissionId: string): Promise<void> {
  const permission = await prisma.folderPermission.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    throw new NotFoundError('Permission non trouvée');
  }

  await prisma.folderPermission.delete({ where: { id: permissionId } });
}

/**
 * Check if a user can access a folder with the required permission level
 */
export async function canAccessFolder(
  userId: string,
  folderId: string,
  requiredPermission: PermissionType
): Promise<boolean> {
  // Get user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return false;
  }

  // Super Admin has access to everything
  if (user.role === Role.SUPER_ADMIN) {
    return true;
  }

  // Get effective permission for this user's role
  const effective = await getEffectivePermission(folderId, user.role);

  if (!effective.permission) {
    return false;
  }

  return hasRequiredPermission(effective.permission, requiredPermission);
}

/**
 * Check folder access and throw ForbiddenError if denied
 */
export async function checkFolderAccess(
  userId: string,
  folderId: string,
  requiredPermission: PermissionType
): Promise<void> {
  const hasAccess = await canAccessFolder(userId, folderId, requiredPermission);
  if (!hasAccess) {
    throw new ForbiddenError('Accès au dossier refusé');
  }
}

/**
 * Map Prisma permission to response format
 */
function mapPermissionToResponse(permission: {
  id: string;
  folderId: string;
  role: RoleType;
  permission: PermissionType;
  createdAt: Date;
}): FolderPermissionResponse {
  return {
    id: permission.id,
    folderId: permission.folderId,
    role: permission.role,
    permission: permission.permission,
    createdAt: permission.createdAt.toISOString(),
  };
}
