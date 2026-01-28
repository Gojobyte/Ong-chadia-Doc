import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../common/errors.js';
import type { UserPayload } from '../types/express.js';

export { UserPayload };

// =====================
// USER CACHE
// =====================
// In-memory cache for user data to reduce DB queries on every request
// Cache entries expire after 2 minutes to balance performance and data freshness

interface CachedUser {
  user: UserPayload;
  expiresAt: number;
}

const userCache = new Map<string, CachedUser>();
const USER_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const CACHE_CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  userCache.forEach((value, key) => {
    if (value.expiresAt < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => userCache.delete(key));
}, CACHE_CLEANUP_INTERVAL);

/**
 * Invalidate user cache (call after user updates)
 */
export function invalidateUserCache(userId: string): void {
  userCache.delete(userId);
}

/**
 * Clear all user cache entries
 */
export function clearUserCache(): void {
  userCache.clear();
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const now = Date.now();

    // Check cache first
    const cached = userCache.get(payload.userId);
    if (cached && cached.expiresAt > now) {
      req.user = cached.user;
      return next();
    }

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Cache the user
    userCache.set(payload.userId, {
      user,
      expiresAt: now + USER_CACHE_TTL,
    });

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

// Legacy alias for backwards compatibility with auth routes
export const authMiddleware = authenticate;

/**
 * Role-based access control middleware
 * Creates a middleware that checks if user has required role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès non autorisé' });
      return;
    }

    next();
  };
}
