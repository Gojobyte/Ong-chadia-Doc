import type { PrismaClient as PrismaClientType } from '@prisma/client';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Pre-warm database connection on startup
 * This prevents cold start latency on first request
 */
export async function warmupDatabase(): Promise<void> {
  try {
    // Simple query to establish connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection warmed up');
  } catch (error) {
    console.error('Database warmup failed:', error);
    throw error;
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
