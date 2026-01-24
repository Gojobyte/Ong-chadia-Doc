import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteDocument } from '@/hooks/useDocuments';
import type { DocumentResponse } from '@ong-chadia/shared';

interface DeleteDocumentModalProps {
  open: boolean;
  document: DocumentResponse;
  onClose: () => void;
}

export function DeleteDocumentModal({
  open,
  document,
  onClose,
}: DeleteDocumentModalProps) {
  const deleteDocument = useDeleteDocument();

  const handleDelete = async () => {
    await deleteDocument.mutateAsync(document.id);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Supprimer le document
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le document "{document.name}" ?
            Cette action est irréversible et supprimera également toutes les
            versions du document.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={deleteDocument.isPending}
          >
            {deleteDocument.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
