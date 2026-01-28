import { prisma } from '../../config/database.js';
import type { Role } from '@prisma/client';

// Cache implementation
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || entry.expiry < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

export function invalidateUserCache(userId: string): void {
  cache.delete(`dashboard:${userId}`);
  cache.delete(`activity:${userId}`);
}

export function invalidateAllCache(): void {
  cache.clear();
}

// Response types
interface ProjectStats {
  total: number;
  byStatus: {
    DRAFT: number;
    PREPARATION: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
}

interface MyProject {
  id: string;
  name: string;
  status: string;
  endDate: string | null;
}

interface RecentDocument {
  id: string;
  name: string;
  mimeType: string;
  createdAt: string;
  folder: { id: string; name: string };
}

interface UpcomingDeadline {
  id: string;
  name: string;
  endDate: string;
  daysRemaining: number;
}

interface DashboardStats {
  totalDocuments: number;
  totalProjects: number;
  totalUsers?: number;
}

export interface DashboardResponse {
  projects: ProjectStats;
  myProjects: MyProject[];
  recentDocuments: RecentDocument[];
  upcomingDeadlines: UpcomingDeadline[];
  stats: DashboardStats;
}

interface ActivityItem {
  id: string;
  type: 'document_upload' | 'project_created' | 'document_shared';
  user: { id: string; firstName: string; lastName: string };
  target: { id: string; name: string; type: string };
  createdAt: string;
}

export interface ActivityResponse {
  data: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get dashboard aggregated data for a user
 */
export async function getDashboardData(
  userId: string,
  userRole: Role
): Promise<DashboardResponse> {
  const cacheKey = `dashboard:${userId}`;
  const cached = getCached<DashboardResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const isAdmin = userRole === 'SUPER_ADMIN';
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Execute all queries in parallel for performance
  const [
    projectsGrouped,
    totalProjects,
    myProjects,
    recentDocuments,
    upcomingDeadlines,
    totalDocuments,
    totalUsers,
  ] = await Promise.all([
    // Projects by status
    prisma.project.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    }),

    // Total projects
    prisma.project.count({ where: { deletedAt: null } }),

    // User's recent projects (member of)
    prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { createdById: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        endDate: true,
      },
    }),

    // Recent documents (accessible to user based on role)
    prisma.document.findMany({
      where: isAdmin
        ? {}
        : {
            OR: [
              { uploadedById: userId },
              {
                folder: {
                  permissions: {
                    some: {
                      role: userRole,
                      permission: { in: ['READ', 'WRITE', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        mimeType: true,
        createdAt: true,
        folder: {
          select: { id: true, name: true },
        },
      },
    }),

    // Upcoming deadlines (projects with endDate in next 30 days)
    prisma.project.findMany({
      where: {
        deletedAt: null,
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        OR: isAdmin
          ? undefined
          : [
              { createdById: userId },
              { members: { some: { userId } } },
            ],
      },
      orderBy: { endDate: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        endDate: true,
      },
    }),

    // Total documents count
    prisma.document.count(),

    // Total users (only for admin)
    isAdmin ? prisma.user.count({ where: { isActive: true } }) : null,
  ]);

  // Process projects by status
  const byStatus = {
    DRAFT: 0,
    PREPARATION: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };
  for (const group of projectsGrouped) {
    if (group.status in byStatus) {
      byStatus[group.status as keyof typeof byStatus] = group._count.id;
    }
  }

  // Process upcoming deadlines with days remaining
  const deadlinesWithDays: UpcomingDeadline[] = upcomingDeadlines
    .filter((p) => p.endDate !== null)
    .map((p) => ({
      id: p.id,
      name: p.name,
      endDate: p.endDate!.toISOString(),
      daysRemaining: Math.ceil(
        (p.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

  const response: DashboardResponse = {
    projects: {
      total: totalProjects,
      byStatus,
    },
    myProjects: myProjects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      endDate: p.endDate?.toISOString() || null,
    })),
    recentDocuments: recentDocuments.map((d) => ({
      id: d.id,
      name: d.name,
      mimeType: d.mimeType,
      createdAt: d.createdAt.toISOString(),
      folder: d.folder,
    })),
    upcomingDeadlines: deadlinesWithDays,
    stats: {
      totalDocuments,
      totalProjects,
      ...(isAdmin && totalUsers !== null ? { totalUsers } : {}),
    },
  };

  setCache(cacheKey, response);
  return response;
}

/**
 * Get recent activity (uploads, project creations, shares)
 */
export async function getActivityData(
  userId: string,
  userRole: Role,
  page: number = 1,
  limit: number = 20
): Promise<ActivityResponse> {
  const cacheKey = `activity:${userId}:${page}:${limit}`;
  const cached = getCached<ActivityResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const skip = (page - 1) * limit;
  const isAdmin = userRole === 'SUPER_ADMIN';

  // Get recent document uploads
  const [documents, documentCount] = await Promise.all([
    prisma.document.findMany({
      where: isAdmin
        ? {}
        : {
            OR: [
              { uploadedById: userId },
              {
                folder: {
                  permissions: {
                    some: {
                      role: userRole,
                      permission: { in: ['READ', 'WRITE', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        createdAt: true,
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.document.count({
      where: isAdmin
        ? {}
        : {
            OR: [
              { uploadedById: userId },
              {
                folder: {
                  permissions: {
                    some: {
                      role: userRole,
                      permission: { in: ['READ', 'WRITE', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
    }),
  ]);

  // Map to activity items
  const activityItems: ActivityItem[] = documents.map((doc) => ({
    id: doc.id,
    type: 'document_upload' as const,
    user: doc.uploadedBy,
    target: {
      id: doc.id,
      name: doc.name,
      type: 'document',
    },
    createdAt: doc.createdAt.toISOString(),
  }));

  const response: ActivityResponse = {
    data: activityItems,
    pagination: {
      page,
      limit,
      total: documentCount,
      totalPages: Math.ceil(documentCount / limit),
    },
  };

  setCache(cacheKey, response);
  return response;
}
