import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projects.service';
import { toast } from '@/hooks/useToast';
import type {
  ProjectQueryParams,
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  LinkDocumentDto,
} from '@ong-chadia/shared';

// Cache durations
const PROJECT_LIST_STALE_TIME = 1000 * 60 * 2; // 2 minutes
const PROJECT_DETAIL_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60 * 15; // 15 minutes

/**
 * Get projects list with filters and pagination
 */
export function useProjects(params?: ProjectQueryParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsService.getAll(params),
    staleTime: PROJECT_LIST_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Get a single project by ID
 */
export function useProject(id: string | null) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getById(id!),
    enabled: !!id,
    staleTime: PROJECT_DETAIL_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Create project mutation
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Succès',
        description: 'Projet créé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update project mutation
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      toast({
        title: 'Succès',
        description: 'Projet modifié avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la modification',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete project mutation
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Succès',
        description: 'Projet supprimé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    },
  });
}

// =====================
// MEMBERS HOOKS
// =====================

/**
 * Get project members
 */
export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => projectsService.getMembers(projectId!),
    enabled: !!projectId,
    staleTime: PROJECT_DETAIL_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Add member mutation
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AddMemberDto }) =>
      projectsService.addMember(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast({
        title: 'Succès',
        description: 'Membre ajouté au projet',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'ajout',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update member role mutation
 */
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId, data }: { projectId: string; memberId: string; data: UpdateMemberRoleDto }) =>
      projectsService.updateMemberRole(projectId, memberId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
      toast({
        title: 'Succès',
        description: 'Rôle modifié',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la modification',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove member mutation
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      projectsService.removeMember(projectId, memberId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast({
        title: 'Succès',
        description: 'Membre retiré du projet',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du retrait',
        variant: 'destructive',
      });
    },
  });
}

// =====================
// DOCUMENTS HOOKS
// =====================

/**
 * Get project documents
 */
export function useProjectDocuments(projectId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['projects', projectId, 'documents', params],
    queryFn: () => projectsService.getDocuments(projectId!, params),
    enabled: !!projectId,
    staleTime: PROJECT_DETAIL_STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Link document mutation
 */
export function useLinkProjectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: LinkDocumentDto }) =>
      projectsService.linkDocument(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast({
        title: 'Succès',
        description: 'Document lié au projet',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la liaison',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Unlink document mutation
 */
export function useUnlinkProjectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, documentId }: { projectId: string; documentId: string }) =>
      projectsService.unlinkDocument(projectId, documentId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast({
        title: 'Succès',
        description: 'Document délié du projet',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    },
  });
}
