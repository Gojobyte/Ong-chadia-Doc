import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useBulkDelete } from '@/hooks/useBulk';

interface BulkDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
  onSuccess?: () => void;
}

export function BulkDeleteModal({
  open,
  onOpenChange,
  documentIds,
  onSuccess,
}: BulkDeleteModalProps) {
  const { mutate: bulkDelete, isPending } = useBulkDelete();

  const handleDelete = () => {
    bulkDelete(documentIds, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle>Supprimer {documentIds.length} document{documentIds.length > 1 ? 's' : ''}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Êtes-vous sûr de vouloir supprimer {documentIds.length} document{documentIds.length > 1 ? 's' : ''} ?
            Cette action est irréversible et supprimera également toutes les versions associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
