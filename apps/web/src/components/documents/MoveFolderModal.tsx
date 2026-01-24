import { useState } from 'react';
import { Loader2, Folder, Home, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRootFolders, useFolderChildren, useUpdateFolder } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';
import type { FolderResponse } from '@ong-chadia/shared';

interface MoveFolderModalProps {
  open: boolean;
  folder: FolderResponse;
  onClose: () => void;
}

interface FolderSelectorItemProps {
  folder: FolderResponse;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  excludeId: string;
}

function FolderSelectorItem({
  folder,
  level,
  selectedId,
  onSelect,
  excludeId,
}: FolderSelectorItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: children } = useFolderChildren(isExpanded ? folder.id : null);
  const hasChildren = folder._count?.children && folder._count.children > 0;

  // Don't show the folder being moved or its descendants
  if (folder.id === excludeId) return null;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
          'hover:bg-slate-100',
          selectedId === folder.id && 'bg-primary-50 text-primary-700'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(folder.id)}
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
      </div>

      {isExpanded &&
        children?.map((child) => (
          <FolderSelectorItem
            key={child.id}
            folder={child}
            level={level + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            excludeId={excludeId}
          />
        ))}
    </div>
  );
}

export function MoveFolderModal({ open, folder, onClose }: MoveFolderModalProps) {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    folder.parentId
  );
  const { data: rootFolders, isLoading } = useRootFolders();
  const updateFolder = useUpdateFolder();

  const handleMove = async () => {
    await updateFolder.mutateAsync({
      id: folder.id,
      data: { parentId: selectedParentId },
    });
    onClose();
  };

  const hasChanged = selectedParentId !== folder.parentId;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Déplacer le dossier</DialogTitle>
          <DialogDescription>
            Sélectionnez un nouveau dossier parent pour "{folder.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="p-2">
              {/* Root option */}
              <div
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
                  'hover:bg-slate-100',
                  selectedParentId === null && 'bg-primary-50 text-primary-700'
                )}
                onClick={() => setSelectedParentId(null)}
              >
                <div className="w-5" />
                <Home className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">Racine</span>
              </div>

              {/* Folder tree */}
              {rootFolders?.map((rootFolder) => (
                <FolderSelectorItem
                  key={rootFolder.id}
                  folder={rootFolder}
                  level={0}
                  selectedId={selectedParentId}
                  onSelect={setSelectedParentId}
                  excludeId={folder.id}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleMove}
            disabled={!hasChanged || updateFolder.isPending}
          >
            {updateFolder.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Déplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
