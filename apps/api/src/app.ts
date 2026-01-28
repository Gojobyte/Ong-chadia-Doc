import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { foldersRoutes } from './modules/folders/index.js';
import { documentsRoutes, shareRoutes } from './modules/documents/index.js';
import { favoritesRoutes } from './modules/favorites/index.js';
import { tagsRoutes } from './modules/tags/index.js';
import { metadataRoutes } from './modules/metadata/index.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import { projectsRoutes } from './modules/projects/index.js';
import { dashboardRoutes } from './modules/dashboard/index.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { logger, logRequest } from './utils/logger.js';

const app: Express = express();
const isProduction = process.env.NODE_ENV === 'production';

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''].filter(Boolean),
    },
  } : false, // Disable CSP in development
  crossOriginEmbedderPolicy: false, // Required for some file previews
}));

// Compression middleware - reduces response size by ~70%
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// CORS middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// General rate limiting (skip health checks)
if (isProduction) {
  app.use(generalLimiter);
}

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Extract user ID from request if authenticated
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    logRequest(req.method, req.path, res.statusCode, duration, userId);
  });

  next();
});

// Health check routes (mounted before API routes)
app.use('/api', healthRoutes);

// Legacy health check for backwards compatibility
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'ONG Chadia API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Users routes
app.use('/api/users', usersRoutes);

// Folders routes (GED)
app.use('/api/folders', foldersRoutes);

// Documents routes (GED)
app.use('/api/documents', documentsRoutes);

// Favorites routes
app.use('/api/favorites', favoritesRoutes);

// Tags routes
app.use('/api/tags', tagsRoutes);

// Metadata routes
app.use('/api/metadata', metadataRoutes);

// Share routes (public, no auth required)
app.use('/api/share', shareRoutes);

// Analytics routes (Staff/Admin only)
app.use('/api/analytics', analyticsRoutes);

// Projects routes (Epic 3)
app.use('/api/projects', projectsRoutes);

// Dashboard routes (Epic 4)
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
