import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../common/errors.js';
import type { ProjectMember, AddMemberDto, ProjectMembersResponse, ProjectRole } from '@ong-chadia/shared';

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMembersResponse> {
  // Verify project exists and is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      assignedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' }, // PROJECT_MANAGER first
      { assignedAt: 'asc' },
    ],
  });

  return {
    data: members.map(mapMemberToResponse),
    count: members.length,
  };
}

/**
 * Add a member to a project
 */
export async function addMember(
  projectId: string,
  data: AddMemberDto,
  assignedById: string
): Promise<ProjectMember> {
  // Verify project exists and is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, deletedAt: true },
  });

  if (!project || project.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) {
    throw new NotFoundError('Utilisateur non trouvé');
  }

  if (!user.isActive) {
    throw new BadRequestError('Cet utilisateur est désactivé');
  }

  // Check if user is already assigned to this project
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: data.userId,
      },
    },
  });

  if (existingMember) {
    throw new ConflictError('Cet utilisateur est déjà membre du projet');
  }

  // Validation: Contributors can only be assigned as VOLUNTEER
  if (user.role === 'CONTRIBUTOR' && data.role !== 'VOLUNTEER') {
    throw new BadRequestError('Les contributeurs ne peuvent être assignés qu\'en tant que bénévoles (VOLUNTEER)');
  }

  // Create member
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: data.userId,
      role: data.role,
      assignedById,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      assignedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return mapMemberToResponse(member);
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  newRole: ProjectRole
): Promise<ProjectMember> {
  // Get the member with user info
  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: { id: true, role: true },
      },
    },
  });

  if (!member || member.projectId !== projectId) {
    throw new NotFoundError('Membre non trouvé dans ce projet');
  }

  // Check if project is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { deletedAt: true },
  });

  if (project?.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Validation: Contributors can only have VOLUNTEER role
  if (member.user.role === 'CONTRIBUTOR' && newRole !== 'VOLUNTEER') {
    throw new BadRequestError('Les contributeurs ne peuvent avoir que le rôle bénévole (VOLUNTEER)');
  }

  // Validation: Cannot change role of last PROJECT_MANAGER to something else
  if (member.role === 'PROJECT_MANAGER' && newRole !== 'PROJECT_MANAGER') {
    const pmCount = await prisma.projectMember.count({
      where: {
        projectId,
        role: 'PROJECT_MANAGER',
      },
    });

    if (pmCount <= 1) {
      throw new BadRequestError('Impossible de modifier le rôle du dernier chef de projet. Assignez d\'abord un autre chef de projet.');
    }
  }

  // Update role
  const updated = await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: newRole },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      assignedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return mapMemberToResponse(updated);
}

/**
 * Remove a member from a project
 */
export async function removeMember(projectId: string, memberId: string): Promise<void> {
  // Get the member
  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    select: { id: true, projectId: true, role: true },
  });

  if (!member || member.projectId !== projectId) {
    throw new NotFoundError('Membre non trouvé dans ce projet');
  }

  // Check if project is not deleted
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { deletedAt: true },
  });

  if (project?.deletedAt) {
    throw new NotFoundError('Projet non trouvé');
  }

  // Validation: Cannot remove the last PROJECT_MANAGER
  if (member.role === 'PROJECT_MANAGER') {
    const pmCount = await prisma.projectMember.count({
      where: {
        projectId,
        role: 'PROJECT_MANAGER',
      },
    });

    if (pmCount <= 1) {
      throw new BadRequestError('Impossible de retirer le dernier chef de projet. Assignez d\'abord un autre chef de projet.');
    }
  }

  // Delete member
  await prisma.projectMember.delete({
    where: { id: memberId },
  });
}

/**
 * Check if user is a member of a project
 */
export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
  return !!member;
}

/**
 * Get member role in a project
 */
export async function getMemberRole(projectId: string, userId: string): Promise<ProjectRole | null> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: { role: true },
  });
  return member?.role as ProjectRole | null;
}

/**
 * Map Prisma member to response format
 */
function mapMemberToResponse(member: any): ProjectMember {
  return {
    id: member.id,
    projectId: member.projectId,
    userId: member.userId,
    role: member.role,
    assignedById: member.assignedById,
    assignedAt: member.assignedAt.toISOString(),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
    user: member.user,
    assignedBy: member.assignedBy,
  };
}
