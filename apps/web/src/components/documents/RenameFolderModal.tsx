import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateFolder } from '@/hooks/useFolders';
import type { FolderResponse } from '@ong-chadia/shared';

const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne doit pas dépasser 255 caractères')
    .regex(/^[^<>:"/\\|?*]+$/, 'Le nom contient des caractères invalides'),
});

type RenameFolderForm = z.infer<typeof renameFolderSchema>;

interface RenameFolderModalProps {
  open: boolean;
  folder: FolderResponse;
  onClose: () => void;
}

export function RenameFolderModal({ open, folder, onClose }: RenameFolderModalProps) {
  const updateFolder = useUpdateFolder();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameFolderForm>({
    resolver: zodResolver(renameFolderSchema),
    defaultValues: { name: folder.name },
  });

  // Reset form when modal opens with current folder name
  useEffect(() => {
    if (open) {
      reset({ name: folder.name });
    }
  }, [open, folder.name, reset]);

  const onSubmit = async (data: RenameFolderForm) => {
    await updateFolder.mutateAsync({
      id: folder.id,
      data: { name: data.name },
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer le dossier</DialogTitle>
          <DialogDescription>
            Entrez un nouveau nom pour le dossier "{folder.name}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nouveau nom</Label>
              <Input
                id="name"
                placeholder="Nom du dossier"
                {...register('name')}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || updateFolder.isPending}>
              {(isSubmitting || updateFolder.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Renommer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
