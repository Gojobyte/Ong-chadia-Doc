import { api } from '@/services/api';

export type Period = '7d' | '30d' | '90d' | '12m';

export interface StorageAnalytics {
  used: number;
  quota: number;
  percentage: number;
  documentCount: number;
}

export interface UploadDataPoint {
  date: string;
  count: number;
}

export interface UploadAnalytics {
  data: UploadDataPoint[];
  total: number;
}

export interface TypeDataPoint {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TypeAnalytics {
  data: TypeDataPoint[];
}

export interface FolderDataPoint {
  id: string;
  name: string;
  path: string;
  documentCount: number;
}

export interface FolderAnalytics {
  data: FolderDataPoint[];
}

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

export async function getStorageAnalytics(): Promise<StorageAnalytics> {
  const response = await api.get('/analytics/storage');
  return response.data;
}

export async function getUploadAnalytics(period: Period = '30d'): Promise<UploadAnalytics> {
  const response = await api.get('/analytics/uploads', { params: { period } });
  return response.data;
}

export async function getTypeAnalytics(): Promise<TypeAnalytics> {
  const response = await api.get('/analytics/types');
  return response.data;
}

export async function getFolderAnalytics(limit: number = 5): Promise<FolderAnalytics> {
  const response = await api.get('/analytics/folders', { params: { limit } });
  return response.data;
}

export async function getUserAnalytics(limit: number = 5, period: Period = '30d'): Promise<UserAnalytics> {
  const response = await api.get('/analytics/users', { params: { limit, period } });
  return response.data;
}
