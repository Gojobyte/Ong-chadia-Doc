import { AccessAction as PrismaAccessAction, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../common/errors.js';
import { AccessLogResponse, AccessAction } from '@ong-chadia/shared';

/**
 * Log an access to a document
 */
export async function logAccess(
  documentId: string,
  userId: string | null,
  action: AccessAction | PrismaAccessAction,
  ipAddress: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.accessLog.create({
    data: {
      documentId,
      userId,
      action: action as PrismaAccessAction,
      ipAddress,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}

/**
 * Get access logs for a document with pagination
 */
export async function getAccessLogs(
  documentId: string,
  page = 1,
  pageSize = 50
): Promise<{
  data: AccessLogResponse[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // Verify document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new NotFoundError('Document non trouvé');
  }

  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.accessLog.findMany({
      where: { documentId },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.accessLog.count({ where: { documentId } }),
  ]);

  return {
    data: logs.map(mapAccessLogToResponse),
    total,
    page,
    pageSize,
  };
}

/**
 * Map Prisma AccessLog to response format
 */
function mapAccessLogToResponse(log: {
  id: string;
  documentId: string;
  userId: string | null;
  user: { firstName: string; lastName: string } | null;
  action: PrismaAccessAction;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: Date;
}): AccessLogResponse {
  return {
    id: log.id,
    documentId: log.documentId,
    userId: log.userId,
    user: log.user,
    action: log.action as AccessAction,
    ipAddress: log.ipAddress,
    metadata: (log.metadata as Record<string, unknown>) ?? null,
    createdAt: log.createdAt.toISOString(),
  };
}
