import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Folder, FolderPermission, User, Prisma } from '@prisma/client';

// Mock enum values
const Permission = {
  READ: 'READ' as const,
  WRITE: 'WRITE' as const,
  ADMIN: 'ADMIN' as const,
};

const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  STAFF: 'STAFF' as const,
  CONTRIBUTOR: 'CONTRIBUTOR' as const,
  GUEST: 'GUEST' as const,
};

// Create mock functions
const mockFolderFindUnique = jest.fn<(args: Prisma.FolderFindUniqueArgs) => Promise<Folder | null>>();
const mockPermissionFindMany = jest.fn<(args?: Prisma.FolderPermissionFindManyArgs) => Promise<FolderPermission[]>>();
const mockPermissionFindUnique = jest.fn<(args: Prisma.FolderPermissionFindUniqueArgs) => Promise<FolderPermission | null>>();
const mockPermissionUpsert = jest.fn<(args: Prisma.FolderPermissionUpsertArgs) => Promise<FolderPermission>>();
const mockPermissionDelete = jest.fn<(args: Prisma.FolderPermissionDeleteArgs) => Promise<FolderPermission>>();
const mockUserFindUnique = jest.fn<(args: Prisma.UserFindUniqueArgs) => Promise<User | null>>();

// Mock Prisma before importing the service
jest.unstable_mockModule('../../src/config/database.js', () => ({
  prisma: {
    folder: {
      findUnique: mockFolderFindUnique,
    },
    folderPermission: {
      findMany: mockPermissionFindMany,
      findUnique: mockPermissionFindUnique,
      upsert: mockPermissionUpsert,
      delete: mockPermissionDelete,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
  },
}));

// Import after mocking
const {
  getFolderPermissions,
  getEffectivePermission,
  addPermission,
  removePermission,
  canAccessFolder,
} = await import('../../src/modules/folders/permissions.service.js');

describe('PermissionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFolderPermissions', () => {
    it('should return all permissions for a folder', async () => {
      const mockFolder = { id: 'folder1', name: 'Test' };
      const mockPermissions = [
        {
          id: 'perm1',
          folderId: 'folder1',
          role: Role.STAFF,
          permission: Permission.READ,
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 'perm2',
          folderId: 'folder1',
          role: Role.CONTRIBUTOR,
          permission: Permission.WRITE,
          createdAt: new Date('2026-01-02'),
        },
      ];

      mockFolderFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockPermissionFindMany.mockResolvedValue(mockPermissions as unknown as FolderPermission[]);

      const result = await getFolderPermissions('folder1');

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(Role.STAFF);
      expect(result[0].permission).toBe(Permission.READ);
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFolderFindUnique.mockResolvedValue(null);

      await expect(getFolderPermissions('nonexistent')).rejects.toThrow('Dossier non trouvé');
    });
  });

  describe('getEffectivePermission', () => {
    it('should return ADMIN for SUPER_ADMIN role', async () => {
      const result = await getEffectivePermission('folder1', Role.SUPER_ADMIN);

      expect(result.permission).toBe(Permission.ADMIN);
      expect(result.inherited).toBe(false);
      expect(result.sourceId).toBeNull();
    });

    it('should return direct permission when exists', async () => {
      const mockPermission = {
        id: 'perm1',
        folderId: 'folder1',
        role: Role.STAFF,
        permission: Permission.WRITE,
        createdAt: new Date(),
      };

      mockPermissionFindUnique.mockResolvedValue(mockPermission as unknown as FolderPermission);

      const result = await getEffectivePermission('folder1', Role.STAFF);

      expect(result.permission).toBe(Permission.WRITE);
      expect(result.inherited).toBe(false);
      expect(result.sourceId).toBe('folder1');
    });

    it('should inherit permission from parent folder', async () => {
      const mockParentPermission = {
        id: 'perm1',
        folderId: 'parentFolder',
        role: Role.STAFF,
        permission: Permission.READ,
        createdAt: new Date(),
      };

      // First call: no direct permission on child folder
      mockPermissionFindUnique.mockResolvedValueOnce(null);
      // Folder lookup to get parentId
      mockFolderFindUnique.mockResolvedValueOnce({ parentId: 'parentFolder' } as unknown as Folder);
      // Second call: permission on parent folder
      mockPermissionFindUnique.mockResolvedValueOnce(mockParentPermission as unknown as FolderPermission);

      const result = await getEffectivePermission('childFolder', Role.STAFF);

      expect(result.permission).toBe(Permission.READ);
      expect(result.inherited).toBe(true);
      expect(result.sourceId).toBe('parentFolder');
    });

    it('should return null permission if no permission found in hierarchy', async () => {
      mockPermissionFindUnique.mockResolvedValue(null);
      mockFolderFindUnique.mockResolvedValue({ parentId: null } as unknown as Folder);

      const result = await getEffectivePermission('folder1', Role.STAFF);

      expect(result.permission).toBeNull();
      expect(result.inherited).toBe(false);
    });

    it('should override parent permission with child permission', async () => {
      // Parent has READ, child has WRITE
      const mockChildPermission = {
        id: 'perm1',
        folderId: 'childFolder',
        role: Role.STAFF,
        permission: Permission.WRITE,
        createdAt: new Date(),
      };

      mockPermissionFindUnique.mockResolvedValueOnce(mockChildPermission as unknown as FolderPermission);

      const result = await getEffectivePermission('childFolder', Role.STAFF);

      expect(result.permission).toBe(Permission.WRITE);
      expect(result.inherited).toBe(false);
      expect(result.sourceId).toBe('childFolder');
    });
  });

  describe('addPermission', () => {
    it('should create a new permission', async () => {
      const mockFolder = { id: 'folder1', name: 'Test' };
      const mockCreatedPermission = {
        id: 'newperm',
        folderId: 'folder1',
        role: Role.STAFF,
        permission: Permission.READ,
        createdAt: new Date('2026-01-01'),
      };

      mockFolderFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockPermissionUpsert.mockResolvedValue(mockCreatedPermission as unknown as FolderPermission);

      const result = await addPermission('folder1', {
        role: Role.STAFF,
        permission: Permission.READ,
      });

      expect(result.role).toBe(Role.STAFF);
      expect(result.permission).toBe(Permission.READ);
      expect(mockPermissionUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { folderId_role: { folderId: 'folder1', role: Role.STAFF } },
        })
      );
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFolderFindUnique.mockResolvedValue(null);

      await expect(
        addPermission('nonexistent', { role: Role.STAFF, permission: Permission.READ })
      ).rejects.toThrow('Dossier non trouvé');
    });
  });

  describe('removePermission', () => {
    it('should delete an existing permission', async () => {
      const mockPermission = {
        id: 'perm1',
        folderId: 'folder1',
        role: Role.STAFF,
        permission: Permission.READ,
        createdAt: new Date(),
      };

      mockPermissionFindUnique.mockResolvedValue(mockPermission as unknown as FolderPermission);
      mockPermissionDelete.mockResolvedValue(mockPermission as unknown as FolderPermission);

      await expect(removePermission('perm1')).resolves.toBeUndefined();
      expect(mockPermissionDelete).toHaveBeenCalledWith({ where: { id: 'perm1' } });
    });

    it('should throw NotFoundError if permission does not exist', async () => {
      mockPermissionFindUnique.mockResolvedValue(null);

      await expect(removePermission('nonexistent')).rejects.toThrow('Permission non trouvée');
    });
  });

  describe('canAccessFolder', () => {
    it('should return true for SUPER_ADMIN', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.SUPER_ADMIN } as unknown as User);

      const result = await canAccessFolder('user1', 'folder1', Permission.ADMIN);

      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const result = await canAccessFolder('nonexistent', 'folder1', Permission.READ);

      expect(result).toBe(false);
    });

    it('should return true if user has sufficient permission', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.STAFF } as unknown as User);
      mockPermissionFindUnique.mockResolvedValue({
        permission: Permission.WRITE,
      } as unknown as FolderPermission);

      // User has WRITE, needs READ -> should pass
      const result = await canAccessFolder('user1', 'folder1', Permission.READ);

      expect(result).toBe(true);
    });

    it('should return false if user has insufficient permission', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.STAFF } as unknown as User);
      mockPermissionFindUnique.mockResolvedValue({
        permission: Permission.READ,
      } as unknown as FolderPermission);

      // User has READ, needs WRITE -> should fail
      const result = await canAccessFolder('user1', 'folder1', Permission.WRITE);

      expect(result).toBe(false);
    });

    it('should return false if user has no permission at all', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.STAFF } as unknown as User);
      mockPermissionFindUnique.mockResolvedValue(null);
      mockFolderFindUnique.mockResolvedValue({ parentId: null } as unknown as Folder);

      const result = await canAccessFolder('user1', 'folder1', Permission.READ);

      expect(result).toBe(false);
    });
  });

  describe('Permission hierarchy', () => {
    it('ADMIN permission should satisfy WRITE requirement', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.STAFF } as unknown as User);
      mockPermissionFindUnique.mockResolvedValue({
        permission: Permission.ADMIN,
      } as unknown as FolderPermission);

      const result = await canAccessFolder('user1', 'folder1', Permission.WRITE);

      expect(result).toBe(true);
    });

    it('WRITE permission should satisfy READ requirement', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.STAFF } as unknown as User);
      mockPermissionFindUnique.mockResolvedValue({
        permission: Permission.WRITE,
      } as unknown as FolderPermission);

      const result = await canAccessFolder('user1', 'folder1', Permission.READ);

      expect(result).toBe(true);
    });

    it('READ permission should NOT satisfy WRITE requirement', async () => {
      mockUserFindUnique.mockResolvedValue({ role: Role.STAFF } as unknown as User);
      mockPermissionFindUnique.mockResolvedValue({
        permission: Permission.READ,
      } as unknown as FolderPermission);

      const result = await canAccessFolder('user1', 'folder1', Permission.WRITE);

      expect(result).toBe(false);
    });
  });
});
