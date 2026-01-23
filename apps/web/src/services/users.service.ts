import { api } from './api';
import type { User } from '@ong-chadia/shared';
import { Role } from '@ong-chadia/shared';

export interface UsersParams {
  page?: number;
  limit?: number;
  role?: Role;
  isActive?: boolean;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export interface PaginatedUsers {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersService = {
  async getUsers(params: UsersParams = {}): Promise<PaginatedUsers> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserInput): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
