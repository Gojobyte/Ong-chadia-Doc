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
import { useCreateFolder } from '@/hooks/useFolders';

const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne doit pas dépasser 255 caractères')
    .regex(/^[^<>:"/\\|?*]+$/, 'Le nom contient des caractères invalides'),
});

type CreateFolderForm = z.infer<typeof createFolderSchema>;

interface CreateFolderModalProps {
  open: boolean;
  parentId: string | null;
  onClose: () => void;
}

export function CreateFolderModal({ open, parentId, onClose }: CreateFolderModalProps) {
  const createFolder = useCreateFolder();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFolderForm>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: '' },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({ name: '' });
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateFolderForm) => {
    await createFolder.mutateAsync({
      name: data.name,
      parentId: parentId || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau dossier</DialogTitle>
          <DialogDescription>
            {parentId
              ? 'Créer un sous-dossier dans le dossier sélectionné.'
              : 'Créer un nouveau dossier à la racine.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du dossier</Label>
              <Input
                id="name"
                placeholder="Mon nouveau dossier"
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
            <Button type="submit" disabled={isSubmitting || createFolder.isPending}>
              {(isSubmitting || createFolder.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
