import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type { Folder, Prisma } from '@prisma/client';

// Create mock functions with proper typing
const mockFindMany = jest.fn<(args?: Prisma.FolderFindManyArgs) => Promise<Folder[]>>();
const mockFindUnique = jest.fn<(args: Prisma.FolderFindUniqueArgs) => Promise<Folder | null>>();
const mockFindFirst = jest.fn<(args?: Prisma.FolderFindFirstArgs) => Promise<Folder | null>>();
const mockCreate = jest.fn<(args: Prisma.FolderCreateArgs) => Promise<Folder>>();
const mockUpdate = jest.fn<(args: Prisma.FolderUpdateArgs) => Promise<Folder>>();
const mockDelete = jest.fn<(args: Prisma.FolderDeleteArgs) => Promise<Folder>>();
const mockCount = jest.fn<(args?: Prisma.FolderCountArgs) => Promise<number>>();

// Mock Prisma before importing the service
jest.unstable_mockModule('../../src/config/database.js', () => ({
  prisma: {
    folder: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      count: mockCount,
    },
  },
}));

// Import after mocking
const { getRootFolders, getFolderById, getFolderChildren, createFolder, updateFolder, deleteFolder, checkCycleDetection } = await import('../../src/modules/folders/folders.service.js');

describe('FoldersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRootFolders', () => {
    it('should return root folders with pagination', async () => {
      const mockFolders = [
        {
          id: 'clxyz123456789',
          name: 'Documents',
          parentId: null,
          createdById: 'user1',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          _count: { children: 2 },
        },
      ];

      mockFindMany.mockResolvedValue(mockFolders as unknown as Folder[]);
      mockCount.mockResolvedValue(1);

      const result = await getRootFolders('user1', 1, 50);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Documents');
      expect(result.data[0].id).toBe('clxyz123456789');
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(50);
      expect(result.pagination.totalPages).toBe(1);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
          skip: 0,
          take: 50,
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should handle pagination correctly', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(75);

      const result = await getRootFolders('user1', 2, 25);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(25);
      expect(result.pagination.total).toBe(75);
      expect(result.pagination.totalPages).toBe(3);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 25, // (page 2 - 1) * 25
          take: 25,
        })
      );
    });
  });

  describe('getFolderById', () => {
    it('should return folder with children', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Documents',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        children: [
          {
            id: 'folder2',
            name: 'Photos',
            parentId: 'folder1',
            createdById: 'user1',
            createdAt: new Date('2026-01-02'),
            updatedAt: new Date('2026-01-02'),
            _count: { children: 0 },
          },
        ],
        _count: { children: 1 },
      };

      mockFindUnique.mockResolvedValue(mockFolder as unknown as Folder);

      const result = await getFolderById('folder1');

      expect(result.name).toBe('Documents');
      expect(result.id).toBe('folder1');
      expect(result.children).toHaveLength(1);
      expect(result.children![0].name).toBe('Photos');
      expect(result.children![0].id).toBe('folder2');
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(getFolderById('nonexistent')).rejects.toThrow('Dossier non trouvé');
    });
  });

  describe('getFolderChildren', () => {
    it('should return children of a folder', async () => {
      const mockParent = { id: 'parent1', name: 'Parent' };
      const mockChildren = [
        {
          id: 'child1',
          name: 'Child 1',
          parentId: 'parent1',
          createdById: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { children: 0 },
        },
      ];

      mockFindUnique.mockResolvedValue(mockParent as unknown as Folder);
      mockFindMany.mockResolvedValue(mockChildren as unknown as Folder[]);
      mockCount.mockResolvedValue(1);

      const result = await getFolderChildren('parent1', 1, 50);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Child 1');
    });

    it('should throw NotFoundError if parent folder does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(getFolderChildren('nonexistent')).rejects.toThrow('Dossier parent non trouvé');
    });
  });

  describe('createFolder', () => {
    it('should create a root folder', async () => {
      const mockCreatedFolder = {
        id: 'newfolder',
        name: 'New Folder',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        _count: { children: 0 },
      };

      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedFolder as unknown as Folder);

      const result = await createFolder({ name: 'New Folder' }, 'user1');

      expect(result.name).toBe('New Folder');
      expect(result.parentId).toBeNull();
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Folder',
            parentId: null,
            createdById: 'user1',
          }),
        })
      );
    });

    it('should create a subfolder with parentId', async () => {
      const mockParent = { id: 'parent1', name: 'Parent' };
      const mockCreatedFolder = {
        id: 'subfolder1',
        name: 'Subfolder',
        parentId: 'parent1',
        createdById: 'user1',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        _count: { children: 0 },
      };

      mockFindUnique.mockResolvedValue(mockParent as unknown as Folder);
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedFolder as unknown as Folder);

      const result = await createFolder({ name: 'Subfolder', parentId: 'parent1' }, 'user1');

      expect(result.name).toBe('Subfolder');
      expect(result.parentId).toBe('parent1');
    });

    it('should throw ConflictError if name already exists in same parent', async () => {
      const existingFolder = { id: 'existing', name: 'Duplicate' };
      mockFindFirst.mockResolvedValue(existingFolder as unknown as Folder);

      await expect(
        createFolder({ name: 'Duplicate' }, 'user1')
      ).rejects.toThrow('Un dossier avec ce nom existe déjà dans ce répertoire');
    });

    it('should throw NotFoundError if parent does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        createFolder({ name: 'Test', parentId: 'nonexistent' }, 'user1')
      ).rejects.toThrow('Dossier parent non trouvé');
    });
  });

  describe('updateFolder', () => {
    it('should rename a folder successfully', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Old Name',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };

      const mockUpdatedFolder = {
        ...mockFolder,
        name: 'New Name',
        updatedAt: new Date('2026-01-02'),
        _count: { children: 0 },
      };

      mockFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockFindFirst.mockResolvedValue(null); // No duplicate
      mockUpdate.mockResolvedValue(mockUpdatedFolder as unknown as Folder);

      const result = await updateFolder('folder1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'folder1' },
          data: expect.objectContaining({ name: 'New Name' }),
        })
      );
    });

    it('should move folder to new parent', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Test Folder',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewParent = { id: 'newparent', name: 'New Parent', parentId: null };

      const mockUpdatedFolder = {
        ...mockFolder,
        parentId: 'newparent',
        _count: { children: 0 },
      };

      mockFindUnique
        .mockResolvedValueOnce(mockFolder as unknown as Folder) // Original folder
        .mockResolvedValueOnce(mockNewParent as unknown as Folder) // New parent exists
        .mockResolvedValueOnce({ parentId: null } as unknown as Folder); // Cycle check - new parent has no parent

      mockFindFirst.mockResolvedValue(null); // No duplicate name
      mockUpdate.mockResolvedValue(mockUpdatedFolder as unknown as Folder);

      const result = await updateFolder('folder1', { parentId: 'newparent' });

      expect(result.parentId).toBe('newparent');
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        updateFolder('nonexistent', { name: 'Test' })
      ).rejects.toThrow('Dossier non trouvé');
    });

    it('should throw BadRequestError if moving creates a cycle', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Parent',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTargetFolder = { id: 'folder2', name: 'Child', parentId: 'folder1' };

      mockFindUnique
        .mockResolvedValueOnce(mockFolder as unknown as Folder)
        .mockResolvedValueOnce(mockTargetFolder as unknown as Folder) // Target exists
        .mockResolvedValueOnce({ parentId: 'folder1' } as unknown as Folder); // Target's parent is folder1 - CYCLE!

      await expect(
        updateFolder('folder1', { parentId: 'folder2' })
      ).rejects.toThrow('Impossible de déplacer un dossier dans un de ses sous-dossiers');
    });

    it('should throw ConflictError if name already exists in target parent', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Test',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingFolder = { id: 'other', name: 'Test' };

      mockFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockFindFirst.mockResolvedValue(existingFolder as unknown as Folder);

      await expect(
        updateFolder('folder1', { name: 'Test' })
      ).rejects.toThrow('Un dossier avec ce nom existe déjà dans ce répertoire');
    });
  });

  describe('deleteFolder', () => {
    it('should delete an empty folder', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Empty Folder',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { children: 0 },
      };

      mockFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockDelete.mockResolvedValue(mockFolder as unknown as Folder);

      await expect(deleteFolder('folder1')).resolves.toBeUndefined();

      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'folder1' } });
    });

    it('should throw BadRequestError if folder has children', async () => {
      const mockFolder = {
        id: 'folder1',
        name: 'Non-empty Folder',
        parentId: null,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { children: 3 },
      };

      mockFindUnique.mockResolvedValue(mockFolder as unknown as Folder);

      await expect(deleteFolder('folder1')).rejects.toThrow(
        'Impossible de supprimer un dossier contenant des sous-dossiers'
      );

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(deleteFolder('nonexistent')).rejects.toThrow('Dossier non trouvé');
    });
  });

  describe('checkCycleDetection', () => {
    it('should detect a direct cycle (folder moved to itself)', async () => {
      const hasCycle = await checkCycleDetection('folder1', 'folder1');
      expect(hasCycle).toBe(true);
    });

    it('should detect an indirect cycle (folder moved to its descendant)', async () => {
      // Simulating: folder1 -> folder2 -> folder3
      // Trying to move folder1 into folder3 would create a cycle
      mockFindUnique
        .mockResolvedValueOnce({ parentId: 'folder2' } as unknown as Folder) // folder3's parent is folder2
        .mockResolvedValueOnce({ parentId: 'folder1' } as unknown as Folder); // folder2's parent is folder1 - CYCLE!

      const hasCycle = await checkCycleDetection('folder1', 'folder3');
      expect(hasCycle).toBe(true);
    });

    it('should return false when there is no cycle', async () => {
      mockFindUnique
        .mockResolvedValueOnce({ parentId: 'otherFolder' } as unknown as Folder)
        .mockResolvedValueOnce({ parentId: null } as unknown as Folder);

      const hasCycle = await checkCycleDetection('folder1', 'folder2');
      expect(hasCycle).toBe(false);
    });

    it('should return false when moving to root level', async () => {
      // Moving to null (root) can never create a cycle
      const hasCycle = await checkCycleDetection('folder1', 'rootFolder');

      // The first lookup finds the parent
      mockFindUnique.mockResolvedValueOnce({ parentId: null } as unknown as Folder);

      expect(hasCycle).toBe(false);
    });
  });
});
