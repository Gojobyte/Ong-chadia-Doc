import { randomUUID } from 'crypto';
import { supabase, STORAGE_BUCKET } from '../../config/supabase.config.js';
import { StorageError } from '../../common/errors.js';

/**
 * Generate a structured storage path for a file
 * Format: org/{folderId}/{uuid}_{filename}
 */
export function generateStoragePath(folderId: string, filename: string): string {
  const uuid = randomUUID();
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `org/${folderId}/${uuid}_${safeFilename}`;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  buffer: Buffer,
  storagePath: string,
  mimeType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new StorageError(`Échec de l'upload: ${error.message}`);
  }

  return data.path;
}

/**
 * Get a signed URL for a file (temporary access)
 */
export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new StorageError(`Échec de la génération d'URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new StorageError(`Échec de la suppression: ${error.message}`);
  }
}
