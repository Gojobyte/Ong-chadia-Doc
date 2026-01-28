import { useState } from 'react';
import { Loader2, Folder, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRootFolders, useFolderChildren } from '@/hooks/useFolders';
import { useUpdateDocument } from '@/hooks/useDocuments';
import { cn } from '@/lib/utils';
import type { DocumentResponse, FolderResponse } from '@ong-chadia/shared';

interface MoveDocumentModalProps {
  open: boolean;
  document: DocumentResponse;
  onClose: () => void;
}

interface FolderSelectorItemProps {
  folder: FolderResponse;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentFolderId: string;
}

function FolderSelectorItem({
  folder,
  level,
  selectedId,
  onSelect,
  currentFolderId,
}: FolderSelectorItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: children } = useFolderChildren(isExpanded ? folder.id : null);
  const hasChildren = folder._count?.children && folder._count.children > 0;
  const isCurrent = folder.id === currentFolderId;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
          isCurrent
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'hover:bg-slate-100',
          selectedId === folder.id && !isCurrent && 'bg-primary-50 text-primary-700'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => !isCurrent && onSelect(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5"
          >
            <ChevronRight
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        <Folder className="w-4 h-4 text-amber-500" />
        <span className="text-sm">{folder.name}</span>
        {isCurrent && (
          <span className="text-xs text-slate-400 ml-auto">(actuel)</span>
        )}
      </div>

      {isExpanded &&
        children?.map((child) => (
          <FolderSelectorItem
            key={child.id}
            folder={child}
            level={level + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            currentFolderId={currentFolderId}
          />
        ))}
    </div>
  );
}

export function MoveDocumentModal({ open, document, onClose }: MoveDocumentModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(document.folderId);
  const { data: rootFolders, isLoading } = useRootFolders();
  const updateDocument = useUpdateDocument();

  const handleMove = async () => {
    if (selectedFolderId === document.folderId) return;

    await updateDocument.mutateAsync({
      id: document.id,
      data: { folderId: selectedFolderId },
    });
    onClose();
  };

  const hasChanged = selectedFolderId !== document.folderId;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Déplacer le document</DialogTitle>
          <DialogDescription>
            Sélectionnez le dossier de destination pour "{document.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="p-2">
              {/* Folder tree */}
              {rootFolders?.map((folder) => (
                <FolderSelectorItem
                  key={folder.id}
                  folder={folder}
                  level={0}
                  selectedId={selectedFolderId}
                  onSelect={setSelectedFolderId}
                  currentFolderId={document.folderId}
                />
              ))}

              {(!rootFolders || rootFolders.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucun dossier disponible
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleMove}
            disabled={!hasChanged || updateDocument.isPending}
          >
            {updateDocument.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Déplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
