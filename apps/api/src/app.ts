import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { foldersRoutes } from './modules/folders/index.js';
import { documentsRoutes } from './modules/documents/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app: Express = express();

// Middleware
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

// Health check
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

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
