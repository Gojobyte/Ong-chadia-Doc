import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  usersService,
  type UsersParams,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/services/users.service';
import { toast } from '@/hooks/useToast';

export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Succès',
        description: 'Utilisateur créé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la création',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Succès',
        description: 'Utilisateur modifié avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la modification',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Succès',
        description: 'Utilisateur désactivé avec succès',
        variant: 'success',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la désactivation',
        variant: 'destructive',
      });
    },
  });
}
