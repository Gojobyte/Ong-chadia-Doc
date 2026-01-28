import { api } from './api';

// API Response types
export interface ProjectStats {
  total: number;
  byStatus: {
    DRAFT: number;
    PREPARATION: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
}

export interface MyProject {
  id: string;
  name: string;
  status: string;
  endDate: string | null;
}

export interface RecentDocument {
  id: string;
  name: string;
  mimeType: string;
  createdAt: string;
  folder: { id: string; name: string };
}

export interface UpcomingDeadline {
  id: string;
  name: string;
  endDate: string;
  daysRemaining: number;
}

export interface DashboardStats {
  totalDocuments: number;
  totalProjects: number;
  totalUsers?: number;
}

export interface DashboardData {
  projects: ProjectStats;
  myProjects: MyProject[];
  recentDocuments: RecentDocument[];
  upcomingDeadlines: UpcomingDeadline[];
  stats: DashboardStats;
}

export interface ActivityItem {
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
 * Fetch dashboard aggregated data
 */
export async function getDashboard(): Promise<DashboardData> {
  const response = await api.get<DashboardData>('/dashboard');
  return response.data;
}

/**
 * Fetch dashboard activity with pagination
 */
export async function getDashboardActivity(
  page: number = 1,
  limit: number = 10
): Promise<ActivityResponse> {
  const response = await api.get<ActivityResponse>('/dashboard/activity', {
    params: { page, limit },
  });
  return response.data;
}
