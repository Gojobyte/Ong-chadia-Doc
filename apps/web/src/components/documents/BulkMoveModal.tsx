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
import { useBulkMove } from '@/hooks/useBulk';
import { cn } from '@/lib/utils';
import type { FolderResponse } from '@ong-chadia/shared';

interface BulkMoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
  onSuccess?: () => void;
}

interface FolderSelectorItemProps {
  folder: FolderResponse;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function FolderSelectorItem({
  folder,
  level,
  selectedId,
  onSelect,
}: FolderSelectorItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: children } = useFolderChildren(isExpanded ? folder.id : null);
  const hasChildren = folder._count?.children && folder._count.children > 0;

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
          />
        ))}
    </div>
  );
}

export function BulkMoveModal({
  open,
  onOpenChange,
  documentIds,
  onSuccess,
}: BulkMoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { data: rootFolders, isLoading } = useRootFolders();
  const { mutate: bulkMove, isPending } = useBulkMove();

  const handleMove = () => {
    if (!selectedFolderId) return;

    bulkMove(
      { documentIds, targetFolderId: selectedFolderId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedFolderId(null);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setSelectedFolderId(null);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Déplacer {documentIds.length} document{documentIds.length > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le dossier de destination.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="p-2">
              {rootFolders?.map((folder) => (
                <FolderSelectorItem
                  key={folder.id}
                  folder={folder}
                  level={0}
                  selectedId={selectedFolderId}
                  onSelect={setSelectedFolderId}
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
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleMove} disabled={!selectedFolderId || isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Déplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
