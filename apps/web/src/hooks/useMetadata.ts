import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metadataService } from '@/services/metadata.service';
import type { MetadataField } from '@/services/metadata.service';
import { toast } from '@/hooks/useToast';

// Query keys
const TEMPLATES_KEY = ['metadata', 'templates'];

/**
 * Get all metadata templates
 */
export function useMetadataTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => metadataService.getAllTemplates(),
  });
}

/**
 * Get templates for a specific folder
 */
export function useFolderTemplates(folderId: string | null) {
  return useQuery({
    queryKey: [...TEMPLATES_KEY, 'folder', folderId],
    queryFn: () => metadataService.getTemplatesForFolder(folderId!),
    enabled: !!folderId,
  });
}

/**
 * Get a specific template
 */
export function useMetadataTemplate(id: string | null) {
  return useQuery({
    queryKey: [...TEMPLATES_KEY, id],
    queryFn: () => metadataService.getTemplate(id!),
    enabled: !!id,
  });
}

/**
 * Create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; fields: MetadataField[]; folderId?: string }) =>
      metadataService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      toast({
        title: 'Template créé',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le template',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      fields?: MetadataField[];
      folderId?: string;
    }) => metadataService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      toast({
        title: 'Template mis à jour',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le template',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => metadataService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      toast({
        title: 'Template supprimé',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le template',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get document metadata
 */
export function useDocumentMetadata(documentId: string | null) {
  return useQuery({
    queryKey: ['documents', documentId, 'metadata'],
    queryFn: () => metadataService.getDocumentMetadata(documentId!),
    enabled: !!documentId,
  });
}

/**
 * Set document metadata
 */
export function useSetDocumentMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      templateId,
      values,
    }: {
      documentId: string;
      templateId: string;
      values: Record<string, unknown>;
    }) => metadataService.setDocumentMetadata(documentId, templateId, values),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'metadata'] });
      toast({
        title: 'Métadonnées enregistrées',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update document metadata values
 */
export function useUpdateDocumentMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      values,
    }: {
      documentId: string;
      values: Record<string, unknown>;
    }) => metadataService.updateDocumentMetadata(documentId, values),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'metadata'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove document metadata
 */
export function useRemoveDocumentMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => metadataService.removeDocumentMetadata(documentId),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'metadata'] });
      toast({
        title: 'Métadonnées supprimées',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les métadonnées',
        variant: 'destructive',
      });
    },
  });
}
