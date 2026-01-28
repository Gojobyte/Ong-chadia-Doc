import Redis from 'ioredis';
import { logger } from './logger.js';

// Redis connection (optional - gracefully degrades if not available)
let redis: Redis | null = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('error', (err) => {
      logger.warn({ err }, 'Redis connection error - caching disabled');
      redis = null;
    });

    // Connect asynchronously
    redis.connect().catch((err) => {
      logger.warn({ err }, 'Redis connection failed - caching disabled');
      redis = null;
    });
  } catch (err) {
    logger.warn({ err }, 'Redis initialization failed - caching disabled');
    redis = null;
  }
} else {
  logger.info('REDIS_URL not configured - caching disabled');
}

// Cache TTL in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (err) {
    logger.warn({ err, key }, 'Cache get error');
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCache(key: string, value: unknown, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    logger.warn({ err, key }, 'Cache set error');
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    logger.warn({ err, key }, 'Cache delete error');
  }
}

/**
 * Delete cached values by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ err, pattern }, 'Cache pattern delete error');
  }
}

/**
 * Cache key generators
 */
export const cacheKey = {
  folders: (parentId: string | null) => `folders:${parentId || 'root'}`,
  folderTree: () => 'folders:tree',
  folder: (id: string) => `folder:${id}`,
  documents: (folderId: string | null, params?: string) =>
    `documents:${folderId || 'root'}${params ? `:${params}` : ''}`,
  document: (id: string) => `document:${id}`,
  tags: () => 'tags:all',
  popularTags: (limit: number) => `tags:popular:${limit}`,
  userFavorites: (userId: string) => `favorites:${userId}`,
  analytics: (type: string, userId?: string) =>
    `analytics:${type}${userId ? `:${userId}` : ''}`,
};

/**
 * Wrapper for cached function calls
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try cache first
  const cachedValue = await getCache<T>(key);
  if (cachedValue !== null) {
    return cachedValue;
  }

  // Execute function
  const result = await fn();

  // Cache result
  await setCache(key, result, ttl);

  return result;
}

/**
 * Check if Redis is available
 */
export function isCacheAvailable(): boolean {
  return redis !== null && redis.status === 'ready';
}
