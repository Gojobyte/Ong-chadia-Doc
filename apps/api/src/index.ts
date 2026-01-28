import 'dotenv/config';
import app from './app.js';
import { warmupDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Pre-warm database connection to avoid cold start latency
    await warmupDatabase();

    const server = app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server started');
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutdown signal received');
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server stopped gracefully');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.warn('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
