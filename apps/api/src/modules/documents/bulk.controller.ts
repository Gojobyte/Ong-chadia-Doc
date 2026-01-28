import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import archiver from 'archiver';
import { prisma } from '../../config/database.js';
import { canAccessFolder } from '../folders/permissions.service.js';
import * as tagsService from '../tags/tags.service.js';
import { supabase, STORAGE_BUCKET } from '../../config/supabase.config.js';

interface BulkResult {
  success: string[];
  failed: { id: string; error: string }[];
}

// POST /api/documents/bulk/delete - Delete multiple documents
export async function bulkDelete(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentIds } = req.body;
    const userId = req.user!.id;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'documentIds requis (array)' });
    }

    if (documentIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 documents par opération' });
    }

    const result: BulkResult = { success: [], failed: [] };

    // Get all documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      include: { folder: true },
    });

    for (const doc of documents) {
      try {
        // Check permission
        const hasAccess = await canAccessFolder(userId, doc.folderId, 'WRITE');
        if (!hasAccess) {
          result.failed.push({ id: doc.id, error: 'Permission refusée' });
          continue;
        }

        // Delete document
        await prisma.document.delete({
          where: { id: doc.id },
        });

        result.success.push(doc.id);
      } catch (error) {
        result.failed.push({
          id: doc.id,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    res.json({
      deleted: result.success.length,
      failed: result.failed,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/documents/bulk/move - Move multiple documents
export async function bulkMove(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentIds, targetFolderId } = req.body;
    const userId = req.user!.id;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'documentIds requis (array)' });
    }

    if (!targetFolderId) {
      return res.status(400).json({ error: 'targetFolderId requis' });
    }

    if (documentIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 documents par opération' });
    }

    // Check target folder exists and user has write access
    const targetFolder = await prisma.folder.findUnique({
      where: { id: targetFolderId },
    });

    if (!targetFolder) {
      return res.status(404).json({ error: 'Dossier cible non trouvé' });
    }

    const hasTargetAccess = await canAccessFolder(userId, targetFolderId, 'WRITE');
    if (!hasTargetAccess) {
      return res.status(403).json({ error: 'Permission refusée sur le dossier cible' });
    }

    const result: BulkResult = { success: [], failed: [] };

    // Get all documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
    });

    for (const doc of documents) {
      try {
        // Check source folder permission
        const hasSourceAccess = await canAccessFolder(userId, doc.folderId, 'WRITE');
        if (!hasSourceAccess) {
          result.failed.push({ id: doc.id, error: 'Permission refusée sur le dossier source' });
          continue;
        }

        // Move document
        await prisma.document.update({
          where: { id: doc.id },
          data: { folderId: targetFolderId },
        });

        result.success.push(doc.id);
      } catch (error) {
        result.failed.push({
          id: doc.id,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    res.json({
      moved: result.success.length,
      failed: result.failed,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/documents/bulk/tags - Add tags to multiple documents
export async function bulkAddTags(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentIds, tagIds, tagNames } = req.body;
    const userId = req.user!.id;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'documentIds requis (array)' });
    }

    if ((!tagIds || tagIds.length === 0) && (!tagNames || tagNames.length === 0)) {
      return res.status(400).json({ error: 'tagIds ou tagNames requis' });
    }

    if (documentIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 documents par opération' });
    }

    const result: BulkResult = { success: [], failed: [] };

    // Create new tags if tagNames provided
    const newTagIds: string[] = [];
    if (tagNames && tagNames.length > 0) {
      for (const name of tagNames) {
        const tag = await tagsService.createTag(name, '#6366f1', userId);
        newTagIds.push(tag.id);
      }
    }

    const allTagIds = [...(tagIds || []), ...newTagIds];

    // Get all documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
    });

    for (const doc of documents) {
      try {
        // Check permission
        const hasAccess = await canAccessFolder(userId, doc.folderId, 'WRITE');
        if (!hasAccess) {
          result.failed.push({ id: doc.id, error: 'Permission refusée' });
          continue;
        }

        // Add tags
        await tagsService.addTagsToDocument(doc.id, allTagIds);
        result.success.push(doc.id);
      } catch (error) {
        result.failed.push({
          id: doc.id,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    res.json({
      tagged: result.success.length,
      failed: result.failed,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/documents/bulk/download - Download multiple documents as ZIP
export async function bulkDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentIds } = req.body;
    const userId = req.user!.id;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'documentIds requis (array)' });
    }

    if (documentIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 documents par téléchargement' });
    }

    // Get all documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      include: { folder: true },
    });

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Aucun document trouvé' });
    }

    // Check permissions for all documents
    for (const doc of documents) {
      const hasAccess = await canAccessFolder(userId, doc.folderId, 'READ');
      if (!hasAccess) {
        return res.status(403).json({
          error: `Permission refusée pour le document: ${doc.name}`
        });
      }
    }

    // Calculate total size
    const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
    const MAX_ZIP_SIZE = 500 * 1024 * 1024; // 500 MB

    if (totalSize > MAX_ZIP_SIZE) {
      return res.status(400).json({
        error: `Taille totale (${Math.round(totalSize / 1024 / 1024)}Mo) dépasse la limite de 500Mo`
      });
    }

    // Create ZIP archive in memory
    const archive = archiver('zip', { zlib: { level: 5 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Add each document to the archive
    for (const doc of documents) {
      try {
        // Download file from Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(doc.storagePath);

        if (downloadError || !fileData) {
          console.error(`Failed to download ${doc.name}:`, downloadError);
          continue;
        }

        const buffer = Buffer.from(await fileData.arrayBuffer());
        archive.append(buffer, { name: doc.name });
      } catch (error) {
        console.error(`Error adding ${doc.name} to ZIP:`, error);
      }
    }

    await archive.finalize();

    // Wait for all chunks
    const zipBuffer = Buffer.concat(chunks);

    // Upload ZIP to temp storage
    const zipFileName = `bulk-downloads/${userId}/${randomUUID()}.zip`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(zipFileName, zipBuffer, {
        contentType: 'application/zip',
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: `Échec de création du ZIP: ${uploadError.message}` });
    }

    // Create signed URL (1 hour expiry)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(zipFileName, 3600);

    if (urlError || !signedUrlData) {
      return res.status(500).json({ error: 'Échec de génération du lien de téléchargement' });
    }

    res.json({
      downloadUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      totalSize: zipBuffer.length,
      fileCount: documents.length,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/documents/bulk/copy - Copy multiple documents to a folder
export async function bulkCopy(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentIds, targetFolderId } = req.body;
    const userId = req.user!.id;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'documentIds requis (array)' });
    }

    if (!targetFolderId) {
      return res.status(400).json({ error: 'targetFolderId requis' });
    }

    if (documentIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 documents par opération' });
    }

    // Check target folder exists and user has write access
    const targetFolder = await prisma.folder.findUnique({
      where: { id: targetFolderId },
    });

    if (!targetFolder) {
      return res.status(404).json({ error: 'Dossier cible non trouvé' });
    }

    const hasTargetAccess = await canAccessFolder(userId, targetFolderId, 'WRITE');
    if (!hasTargetAccess) {
      return res.status(403).json({ error: 'Permission refusée sur le dossier cible' });
    }

    const result: BulkResult = { success: [], failed: [] };

    // Get all documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
    });

    for (const doc of documents) {
      try {
        // Check source folder read permission
        const hasSourceAccess = await canAccessFolder(userId, doc.folderId, 'READ');
        if (!hasSourceAccess) {
          result.failed.push({ id: doc.id, error: 'Permission refusée sur le dossier source' });
          continue;
        }

        // Download file from Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(doc.storagePath);

        if (downloadError || !fileData) {
          result.failed.push({ id: doc.id, error: 'Échec du téléchargement du fichier' });
          continue;
        }

        // Generate new storage path
        const newStoragePath = `org/${targetFolderId}/${randomUUID()}_${doc.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const buffer = Buffer.from(await fileData.arrayBuffer());

        // Upload copy to Supabase
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(newStoragePath, buffer, {
            contentType: doc.mimeType,
            upsert: false,
          });

        if (uploadError) {
          result.failed.push({ id: doc.id, error: `Échec de la copie: ${uploadError.message}` });
          continue;
        }

        // Create new document record
        const newDoc = await prisma.document.create({
          data: {
            name: doc.name,
            mimeType: doc.mimeType,
            size: doc.size,
            storagePath: newStoragePath,
            folderId: targetFolderId,
            uploadedById: userId,
          },
        });

        result.success.push(newDoc.id);
      } catch (error) {
        result.failed.push({
          id: doc.id,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    res.json({
      copied: result.success.length,
      newDocumentIds: result.success,
      failed: result.failed,
    });
  } catch (error) {
    next(error);
  }
}
