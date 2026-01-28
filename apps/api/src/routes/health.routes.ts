import { Router, Request, Response, type Router as RouterType } from 'express';
import { prisma } from '../config/database.js';
import { getSupabaseClient, STORAGE_BUCKET } from '../config/supabase.config.js';
import { logger } from '../utils/logger.js';

const router: RouterType = Router();

interface HealthStatus {
  status: 'ok' | 'error' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'ok' | 'error';
    storage: 'ok' | 'error' | 'unconfigured';
  };
  error?: string;
}

/**
 * GET /api/health
 * Health check endpoint for load balancers and monitoring
 */
router.get('/health', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const result: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    uptime: process.uptime(),
    services: {
      database: 'ok',
      storage: 'ok',
    },
  };

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    result.services.database = 'error';
    result.status = 'error';
    logger.error({ error }, 'Database health check failed');
  }

  // Check Supabase Storage (if configured)
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage.from(STORAGE_BUCKET).list('', { limit: 1 });
    if (error) {
      result.services.storage = 'error';
      result.status = result.status === 'ok' ? 'degraded' : 'error';
      logger.error({ error }, 'Storage health check failed');
    }
  } catch (error) {
    // Supabase not configured - mark as unconfigured
    if (error instanceof Error && error.message.includes('Supabase not configured')) {
      result.services.storage = 'unconfigured';
      if (result.status === 'ok') {
        result.status = 'degraded';
      }
    } else {
      result.services.storage = 'error';
      result.status = result.status === 'ok' ? 'degraded' : 'error';
      logger.error({ error }, 'Storage health check failed');
    }
  }

  const duration = Date.now() - startTime;
  logger.info({
    status: result.status,
    duration: `${duration}ms`,
    services: result.services
  }, 'Health check completed');

  const statusCode = result.status === 'ok' ? 200 : result.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(result);
});

/**
 * GET /api/health/live
 * Lightweight liveness probe (just checks if server is running)
 */
router.get('/health/live', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/health/ready
 * Readiness probe (checks if server is ready to accept traffic)
 */
router.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database not ready'
    });
  }
});

export default router;
