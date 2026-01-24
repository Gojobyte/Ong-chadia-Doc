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
import { useUpdateDocument } from '@/hooks/useDocuments';
import type { DocumentResponse } from '@ong-chadia/shared';

const renameDocumentSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne doit pas dépasser 255 caractères')
    .regex(/^[^<>:"/\\|?*]+$/, 'Le nom contient des caractères invalides'),
});

type RenameDocumentForm = z.infer<typeof renameDocumentSchema>;

interface RenameDocumentModalProps {
  open: boolean;
  document: DocumentResponse;
  onClose: () => void;
}

export function RenameDocumentModal({
  open,
  document,
  onClose,
}: RenameDocumentModalProps) {
  const updateDocument = useUpdateDocument();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameDocumentForm>({
    resolver: zodResolver(renameDocumentSchema),
    defaultValues: { name: document.name },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({ name: document.name });
    }
  }, [open, document.name, reset]);

  const onSubmit = async (data: RenameDocumentForm) => {
    await updateDocument.mutateAsync({
      id: document.id,
      data: { name: data.name },
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer le document</DialogTitle>
          <DialogDescription>
            Entrez un nouveau nom pour le document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nouveau nom</Label>
              <Input
                id="name"
                placeholder="Nom du document"
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
            <Button
              type="submit"
              disabled={isSubmitting || updateDocument.isPending}
            >
              {(isSubmitting || updateDocument.isPending) && (
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
