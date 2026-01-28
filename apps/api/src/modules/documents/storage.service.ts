import { randomUUID } from 'crypto';
import { supabase, STORAGE_BUCKET } from '../../config/supabase.config.js';
import { StorageError } from '../../common/errors.js';

// =====================
// SIGNED URL CACHE
// =====================
// In-memory cache for signed URLs to reduce Supabase API calls
// URLs are cached for 50 minutes (less than the 1-hour default expiry)

interface CachedUrl {
  url: string;
  expiresAt: number; // Unix timestamp
}

const signedUrlCache = new Map<string, CachedUrl>();

// Cache cleanup interval (every 5 minutes)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;
// Cache URLs for 50 minutes (10 minutes before expiry as safety margin)
const CACHE_TTL_MARGIN = 10 * 60 * 1000;

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  signedUrlCache.forEach((value, key) => {
    if (value.expiresAt < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => signedUrlCache.delete(key));
}, CACHE_CLEANUP_INTERVAL);

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
 * Uses in-memory cache to reduce Supabase API calls
 */
export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const cacheKey = `${storagePath}:${expiresIn}`;
  const now = Date.now();

  // Check cache first
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  // Generate new signed URL
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new StorageError(`Échec de la génération d'URL: ${error.message}`);
  }

  // Cache the URL with expiry (minus safety margin)
  const expiresAt = now + (expiresIn * 1000) - CACHE_TTL_MARGIN;
  signedUrlCache.set(cacheKey, { url: data.signedUrl, expiresAt });

  return data.signedUrl;
}

/**
 * Get multiple signed URLs in batch (uses cache)
 */
export async function getSignedUrls(
  storagePaths: string[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const uncachedPaths: string[] = [];
  const now = Date.now();

  // Check cache for each path
  for (const path of storagePaths) {
    const cacheKey = `${path}:${expiresIn}`;
    const cached = signedUrlCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      result.set(path, cached.url);
    } else {
      uncachedPaths.push(path);
    }
  }

  // Fetch uncached URLs in parallel
  if (uncachedPaths.length > 0) {
    const urlPromises = uncachedPaths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error(`Failed to get signed URL for ${path}: ${error.message}`);
        return { path, url: null };
      }

      // Cache the URL
      const cacheKey = `${path}:${expiresIn}`;
      const expiresAt = now + (expiresIn * 1000) - CACHE_TTL_MARGIN;
      signedUrlCache.set(cacheKey, { url: data.signedUrl, expiresAt });

      return { path, url: data.signedUrl };
    });

    const urlResults = await Promise.all(urlPromises);
    for (const { path, url } of urlResults) {
      if (url) {
        result.set(path, url);
      }
    }
  }

  return result;
}

/**
 * Invalidate cached URL for a storage path
 */
export function invalidateCachedUrl(storagePath: string): void {
  // Remove all cache entries for this path (all expiry variants)
  const keysToDelete: string[] = [];
  signedUrlCache.forEach((_, key) => {
    if (key.startsWith(`${storagePath}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => signedUrlCache.delete(key));
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
