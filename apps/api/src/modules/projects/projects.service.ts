import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import type {
  ProjectWithCounts,
  CreateProjectDto,
  UpdateProjectDto,
  PaginatedProjectsResponse
} from '@ong-chadia/shared';

// Allowed sort fields
const ALLOWED_SORT_FIELDS = ['name', 'createdAt', 'startDate', 'endDate', 'status'] as const;
type SortField = typeof ALLOWED_SORT_FIELDS[number];

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectDto,
  userId: string
): Promise<ProjectWithCounts> {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status || 'DRAFT',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      budget: data.budget ? new Prisma.Decimal(data.budget) : null,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: {
        select: { members: true, documents: true },
      },
    },
  });

  return mapProjectToResponse(project);
}

/**
 * Get all projects with pagination and filters
 */
export async function getProjects(
  params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
    status?: string;
    search?: string;
  }
): Promise<PaginatedProjectsResponse> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  // Validate and set sort field
  const sortField: SortField = ALLOWED_SORT_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : 'createdAt';
  const sortOrder = params.order === 'asc' ? 'asc' : 'desc';

  // Build where clause
  const where: Prisma.ProjectWhereInput = {
    deletedAt: null, // Exclude soft-deleted
  };

  // Status filter (can be single or comma-separated)
  if (params.status) {
    const statuses = params.status.split(',').map(s => s.trim());
    where.status = { in: statuses as any };
  }

  // Search filter (name or description)
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  // Execute query with count
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { members: true, documents: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects.map(mapProjectToResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a project by ID
 */
export async function getProjectById(id: string): Promise<ProjectWithCounts> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: {
        select: { members: true, documents: true },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Projet non trouvé');
  }

  if (project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  return mapProjectToResponse(project);
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  data: UpdateProjectDto
): Promise<ProjectWithCounts> {
  // Check if project exists and is not deleted
  const existing = await prisma.project.findUnique({
    where: { id },
    select: { id: true, deletedAt: true, startDate: true, endDate: true },
  });

  if (!existing || existing.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Validate date coherence
  const newStartDate = data.startDate !== undefined
    ? (data.startDate ? new Date(data.startDate) : null)
    : existing.startDate;
  const newEndDate = data.endDate !== undefined
    ? (data.endDate ? new Date(data.endDate) : null)
    : existing.endDate;

  if (newStartDate && newEndDate && newEndDate < newStartDate) {
    throw new BadRequestError('La date de fin doit être postérieure à la date de début');
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.startDate !== undefined && {
        startDate: data.startDate ? new Date(data.startDate) : null
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate ? new Date(data.endDate) : null
      }),
      ...(data.budget !== undefined && {
        budget: data.budget ? new Prisma.Decimal(data.budget) : null
      }),
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: {
        select: { members: true, documents: true },
      },
    },
  });

  return mapProjectToResponse(project);
}

/**
 * Soft delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Check if user is project manager of a project
 */
export async function isProjectManager(projectId: string, userId: string): Promise<boolean> {
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
      role: 'PROJECT_MANAGER',
    },
  });
  return !!member;
}

/**
 * Map Prisma project to response format
 */
function mapProjectToResponse(project: any): ProjectWithCounts {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate?.toISOString() || null,
    endDate: project.endDate?.toISOString() || null,
    budget: project.budget?.toString() || null,
    createdById: project.createdById,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deletedAt: project.deletedAt?.toISOString() || null,
    _count: project._count,
    createdBy: project.createdBy,
  };
}
