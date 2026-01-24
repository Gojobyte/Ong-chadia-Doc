import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Folder, Document, Prisma } from '@prisma/client';

// Create mock functions
const mockFolderFindUnique = jest.fn<(args: Prisma.FolderFindUniqueArgs) => Promise<Folder | null>>();
const mockDocumentCreate = jest.fn<(args: Prisma.DocumentCreateArgs) => Promise<Document>>();
const mockDocumentFindUnique = jest.fn<(args: Prisma.DocumentFindUniqueArgs) => Promise<Document | null>>();
const mockDocumentFindMany = jest.fn<(args?: Prisma.DocumentFindManyArgs) => Promise<Document[]>>();
const mockDocumentCount = jest.fn<(args?: Prisma.DocumentCountArgs) => Promise<number>>();
const mockDocumentDelete = jest.fn<(args: Prisma.DocumentDeleteArgs) => Promise<Document>>();

// Mock storage service
const mockUploadFile = jest.fn<(buffer: Buffer, path: string, mimeType: string) => Promise<string>>();
const mockGetSignedUrl = jest.fn<(path: string) => Promise<string>>();
const mockDeleteFile = jest.fn<(path: string) => Promise<void>>();
const mockGenerateStoragePath = jest.fn<(folderId: string, fileName: string) => string>();

// Mock Prisma before importing
jest.unstable_mockModule('../../src/config/database.js', () => ({
  prisma: {
    folder: {
      findUnique: mockFolderFindUnique,
    },
    document: {
      create: mockDocumentCreate,
      findUnique: mockDocumentFindUnique,
      findMany: mockDocumentFindMany,
      count: mockDocumentCount,
      delete: mockDocumentDelete,
    },
  },
}));

// Mock storage service
jest.unstable_mockModule('../../src/modules/documents/storage.service.js', () => ({
  uploadFile: mockUploadFile,
  getSignedUrl: mockGetSignedUrl,
  deleteFile: mockDeleteFile,
  generateStoragePath: mockGenerateStoragePath,
}));

// Mock file-type
jest.unstable_mockModule('file-type', () => ({
  fileTypeFromBuffer: jest.fn<(buffer: Buffer) => Promise<{ mime: string } | undefined>>().mockResolvedValue({ mime: 'application/pdf' }),
}));

// Import after mocking
const {
  uploadDocument,
  getDocumentById,
  getDocumentsByFolder,
  deleteDocument,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} = await import('../../src/modules/documents/documents.service.js');

describe('DocumentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateStoragePath.mockReturnValue('org/folder1/uuid_test.pdf');
    mockUploadFile.mockResolvedValue('org/folder1/uuid_test.pdf');
    mockGetSignedUrl.mockResolvedValue('https://storage.example.com/signed-url');
  });

  describe('Constants', () => {
    it('should have correct allowed MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('text/plain');
      expect(ALLOWED_MIME_TYPES).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should have MAX_FILE_SIZE of 50MB', () => {
      expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
    });
  });

  describe('uploadDocument', () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    };

    it('should upload a valid document', async () => {
      const mockFolder = { id: 'folder1', name: 'Documents' };
      const mockDocument = {
        id: 'doc1',
        name: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        storagePath: 'org/folder1/uuid_test.pdf',
        folderId: 'folder1',
        uploadedById: 'user1',
        createdAt: new Date('2026-01-01'),
      };

      mockFolderFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockDocumentCreate.mockResolvedValue(mockDocument as unknown as Document);

      const result = await uploadDocument(mockFile, 'folder1', 'user1');

      expect(result.name).toBe('test.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.url).toBe('https://storage.example.com/signed-url');
      expect(mockUploadFile).toHaveBeenCalled();
      expect(mockDocumentCreate).toHaveBeenCalled();
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFolderFindUnique.mockResolvedValue(null);

      await expect(uploadDocument(mockFile, 'nonexistent', 'user1')).rejects.toThrow(
        'Dossier non trouvé'
      );
    });

    it('should throw FileTooLargeError if file exceeds max size', async () => {
      const mockFolder = { id: 'folder1', name: 'Documents' };
      const largeFile = {
        ...mockFile,
        size: MAX_FILE_SIZE + 1,
      };

      mockFolderFindUnique.mockResolvedValue(mockFolder as unknown as Folder);

      await expect(uploadDocument(largeFile, 'folder1', 'user1')).rejects.toThrow(
        /taille maximale/
      );
    });
  });

  describe('getDocumentById', () => {
    it('should return document with signed URL', async () => {
      const mockDocument = {
        id: 'doc1',
        name: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        storagePath: 'org/folder1/uuid_test.pdf',
        folderId: 'folder1',
        uploadedById: 'user1',
        createdAt: new Date('2026-01-01'),
      };

      mockDocumentFindUnique.mockResolvedValue(mockDocument as unknown as Document);

      const result = await getDocumentById('doc1');

      expect(result.id).toBe('doc1');
      expect(result.name).toBe('test.pdf');
      expect(result.url).toBe('https://storage.example.com/signed-url');
    });

    it('should throw NotFoundError if document does not exist', async () => {
      mockDocumentFindUnique.mockResolvedValue(null);

      await expect(getDocumentById('nonexistent')).rejects.toThrow('Document non trouvé');
    });
  });

  describe('getDocumentsByFolder', () => {
    it('should return documents with pagination', async () => {
      const mockFolder = { id: 'folder1', name: 'Documents' };
      const mockDocuments = [
        {
          id: 'doc1',
          name: 'test1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          storagePath: 'org/folder1/uuid_test1.pdf',
          folderId: 'folder1',
          uploadedById: 'user1',
          createdAt: new Date('2026-01-01'),
        },
      ];

      mockFolderFindUnique.mockResolvedValue(mockFolder as unknown as Folder);
      mockDocumentFindMany.mockResolvedValue(mockDocuments as unknown as Document[]);
      mockDocumentCount.mockResolvedValue(1);

      const result = await getDocumentsByFolder('folder1', 1, 50);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('test1.pdf');
      expect(result.pagination.total).toBe(1);
    });

    it('should throw NotFoundError if folder does not exist', async () => {
      mockFolderFindUnique.mockResolvedValue(null);

      await expect(getDocumentsByFolder('nonexistent')).rejects.toThrow('Dossier non trouvé');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from storage and database', async () => {
      const mockDocument = {
        id: 'doc1',
        name: 'test.pdf',
        storagePath: 'org/folder1/uuid_test.pdf',
      };

      mockDocumentFindUnique.mockResolvedValue(mockDocument as unknown as Document);
      mockDeleteFile.mockResolvedValue(undefined);
      mockDocumentDelete.mockResolvedValue(mockDocument as unknown as Document);

      await expect(deleteDocument('doc1')).resolves.toBeUndefined();

      expect(mockDeleteFile).toHaveBeenCalledWith('org/folder1/uuid_test.pdf');
      expect(mockDocumentDelete).toHaveBeenCalledWith({ where: { id: 'doc1' } });
    });

    it('should throw NotFoundError if document does not exist', async () => {
      mockDocumentFindUnique.mockResolvedValue(null);

      await expect(deleteDocument('nonexistent')).rejects.toThrow('Document non trouvé');
    });
  });
});
