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
import { useDeleteFolder } from '@/hooks/useFolders';
import type { FolderResponse } from '@ong-chadia/shared';

interface DeleteFolderModalProps {
  open: boolean;
  folder: FolderResponse;
  onClose: () => void;
}

export function DeleteFolderModal({ open, folder, onClose }: DeleteFolderModalProps) {
  const deleteFolder = useDeleteFolder();

  const handleDelete = async () => {
    await deleteFolder.mutateAsync(folder.id);
    onClose();
  };

  const hasChildren = folder._count?.children && folder._count.children > 0;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Supprimer le dossier
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasChildren ? (
              <>
                <span className="text-red-600 font-medium">Attention !</span> Le
                dossier "{folder.name}" contient {folder._count?.children}{' '}
                sous-dossier(s). La suppression est permanente et supprimera
                également tous les sous-dossiers et documents.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir supprimer le dossier "{folder.name}" ?
                Cette action est irréversible et supprimera également tous les
                documents contenus.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={deleteFolder.isPending}
          >
            {deleteFolder.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
