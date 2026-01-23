import { prisma } from '../../config/database.js';
import { hashPassword } from '../../utils/hash.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors.js';
import { getPrismaSkipTake, calculatePagination } from '../../common/pagination.js';
import type { Role } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput } from './users.validators.js';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

const USER_SELECT_WITH_UPDATED = {
  ...USER_SELECT,
  updatedAt: true,
} as const;

export const usersService = {
  async list(query: { page: number; limit: number; role?: Role; isActive?: boolean }) {
    const { page, limit, role, isActive } = query;
    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        ...getPrismaSkipTake(page, limit),
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: calculatePagination(page, limit, total),
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_WITH_UPDATED,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await hashPassword(data.password);
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
      select: USER_SELECT,
    });
  },

  async update(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if demoting last super admin
    if (user.role === 'SUPER_ADMIN' && data.role && data.role !== 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestError('Cannot demote the last Super Admin');
      }
    }

    // Check email uniqueness if changing
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new ConflictError('Email already exists');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  },

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  },
};
