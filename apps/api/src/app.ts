import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
