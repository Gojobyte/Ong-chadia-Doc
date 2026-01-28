import { prisma } from '../../config/database.js';

export type Period = '7d' | '30d' | '90d' | '12m';

function getPeriodDays(period: Period): number {
  switch (period) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '12m':
      return 365;
    default:
      return 30;
  }
}

function getStartDate(period: Period): Date {
  const days = getPeriodDays(period);
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Storage analytics
export interface StorageAnalytics {
  used: number;
  quota: number;
  percentage: number;
  documentCount: number;
}

const DEFAULT_QUOTA = 10 * 1024 * 1024 * 1024; // 10 GB

export async function getStorageAnalytics(): Promise<StorageAnalytics> {
  const result = await prisma.document.aggregate({
    _sum: { size: true },
    _count: { id: true },
  });

  const used = result._sum.size || 0;
  const documentCount = result._count.id || 0;
  const quota = DEFAULT_QUOTA;
  const percentage = Math.round((used / quota) * 100);

  return {
    used,
    quota,
    percentage,
    documentCount,
  };
}

// Upload history analytics
export interface UploadDataPoint {
  date: string;
  count: number;
}

export interface UploadAnalytics {
  data: UploadDataPoint[];
  total: number;
}

export async function getUploadAnalytics(period: Period = '30d'): Promise<UploadAnalytics> {
  const startDate = getStartDate(period);

  // Get documents grouped by date
  const documents = await prisma.document.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const dateMap = new Map<string, number>();
  const days = getPeriodDays(period);

  // Initialize all dates with 0
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, 0);
  }

  // Count documents per date
  for (const doc of documents) {
    const dateStr = doc.createdAt.toISOString().split('T')[0];
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  }

  const data: UploadDataPoint[] = Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const total = documents.length;

  return { data, total };
}

// Type distribution analytics
export interface TypeDataPoint {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TypeAnalytics {
  data: TypeDataPoint[];
}

const TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'image/jpeg': 'Images',
  'image/png': 'Images',
  'image/gif': 'Images',
  'image/webp': 'Images',
  'text/plain': 'Texte',
};

export async function getTypeAnalytics(): Promise<TypeAnalytics> {
  const documents = await prisma.document.groupBy({
    by: ['mimeType'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const total = documents.reduce((sum, d) => sum + d._count.id, 0);

  // Group similar types (e.g., all Word formats, all images)
  const groupedMap = new Map<string, number>();

  for (const doc of documents) {
    const label = TYPE_LABELS[doc.mimeType] || 'Autres';
    groupedMap.set(label, (groupedMap.get(label) || 0) + doc._count.id);
  }

  const data: TypeDataPoint[] = Array.from(groupedMap.entries())
    .map(([label, count]) => ({
      type: label.toLowerCase(),
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { data };
}

// Top folders analytics
export interface FolderDataPoint {
  id: string;
  name: string;
  path: string;
  documentCount: number;
}

export interface FolderAnalytics {
  data: FolderDataPoint[];
}

async function getFolderPath(folderId: string): Promise<string> {
  const parts: string[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: { name: string; parentId: string | null } | null = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { name: true, parentId: true },
    });
    if (!folder) break;
    parts.unshift(folder.name);
    currentId = folder.parentId;
  }

  return '/' + parts.join('/');
}

export async function getFolderAnalytics(limit: number = 5): Promise<FolderAnalytics> {
  const folders = await prisma.folder.findMany({
    include: { _count: { select: { documents: true } } },
    orderBy: { documents: { _count: 'desc' } },
    take: limit,
  });

  const data: FolderDataPoint[] = await Promise.all(
    folders
      .filter((f) => f._count.documents > 0)
      .map(async (folder) => ({
        id: folder.id,
        name: folder.name,
        path: await getFolderPath(folder.id),
        documentCount: folder._count.documents,
      }))
  );

  return { data };
}

// Top users analytics
export interface UserDataPoint {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  uploadCount: number;
}

export interface UserAnalytics {
  data: UserDataPoint[];
}

export async function getUserAnalytics(limit: number = 5, period: Period = '30d'): Promise<UserAnalytics> {
  const startDate = getStartDate(period);

  const uploads = await prisma.document.groupBy({
    by: ['uploadedById'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  const userIds = uploads.map((u) => u.uploadedById);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const data: UserDataPoint[] = uploads.map((upload) => {
    const user = userMap.get(upload.uploadedById);
    return {
      id: upload.uploadedById,
      firstName: user?.firstName || 'Utilisateur',
      lastName: user?.lastName || 'Inconnu',
      email: user?.email || '',
      uploadCount: upload._count.id,
    };
  });

  return { data };
}
