import { useState } from 'react';
import { FolderPlus, Home, Loader2 } from 'lucide-react';
import { useRootFolders } from '@/hooks/useFolders';
import { FolderTreeItem } from './FolderTreeItem';
import { CreateFolderModal } from './CreateFolderModal';
import { RenameFolderModal } from './RenameFolderModal';
import { MoveFolderModal } from './MoveFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FolderResponse } from '@ong-chadia/shared';

interface FolderTreeProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function FolderTree({ selectedId, onSelect }: FolderTreeProps) {
  const { data: rootFolders, isLoading, error } = useRootFolders();

  // Modal states
  const [createModal, setCreateModal] = useState<{ open: boolean; parentId: string | null }>({
    open: false,
    parentId: null,
  });
  const [renameModal, setRenameModal] = useState<{
    open: boolean;
    folder: FolderResponse | null;
  }>({ open: false, folder: null });
  const [moveModal, setMoveModal] = useState<{
    open: boolean;
    folder: FolderResponse | null;
  }>({ open: false, folder: null });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    folder: FolderResponse | null;
  }>({ open: false, folder: null });

  const handleCreateSubfolder = (parentId: string) => {
    setCreateModal({ open: true, parentId });
  };

  const handleRename = (folder: FolderResponse) => {
    setRenameModal({ open: true, folder });
  };

  const handleMove = (folder: FolderResponse) => {
    setMoveModal({ open: true, folder });
  };

  const handleDelete = (folder: FolderResponse) => {
    setDeleteModal({ open: true, folder });
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        Erreur lors du chargement des dossiers
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Dossiers</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setCreateModal({ open: true, parentId: null })}
          title="Nouveau dossier"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Root / All documents option */}
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors mb-1',
            'hover:bg-slate-100',
            selectedId === null && 'bg-primary-50 text-primary-700 hover:bg-primary-100'
          )}
          onClick={() => onSelect(null)}
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Tous les documents</span>
        </div>

        {/* Folder items */}
        {rootFolders && rootFolders.length > 0 ? (
          rootFolders.map((folder) => (
            <FolderTreeItem
              key={folder.id}
              folder={folder}
              level={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSubfolder={handleCreateSubfolder}
              onRename={handleRename}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="px-2 py-4 text-sm text-slate-500 text-center">
            Aucun dossier
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        open={createModal.open}
        parentId={createModal.parentId}
        onClose={() => setCreateModal({ open: false, parentId: null })}
      />

      {renameModal.folder && (
        <RenameFolderModal
          open={renameModal.open}
          folder={renameModal.folder}
          onClose={() => setRenameModal({ open: false, folder: null })}
        />
      )}

      {moveModal.folder && (
        <MoveFolderModal
          open={moveModal.open}
          folder={moveModal.folder}
          onClose={() => setMoveModal({ open: false, folder: null })}
        />
      )}

      {deleteModal.folder && (
        <DeleteFolderModal
          open={deleteModal.open}
          folder={deleteModal.folder}
          onClose={() => setDeleteModal({ open: false, folder: null })}
        />
      )}
    </div>
  );
}
