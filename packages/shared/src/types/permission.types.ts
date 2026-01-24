/**
 * Permission levels for folder access control
 */
export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
}

/**
 * User roles in the system
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF = 'STAFF',
  CONTRIBUTOR = 'CONTRIBUTOR',
  GUEST = 'GUEST',
}

/**
 * DTO for creating a folder permission
 */
export interface CreateFolderPermissionDto {
  role: Role;
  permission: Permission;
}

/**
 * Response format for folder permission
 */
export interface FolderPermissionResponse {
  id: string;
  folderId: string;
  role: Role;
  permission: Permission;
  createdAt: string;
}

/**
 * Effective permission result with inheritance info
 */
export interface EffectivePermission {
  permission: Permission | null;
  inherited: boolean;
  sourceId: string | null;
}
