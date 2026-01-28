import { useState } from 'react';
import { Plus, Home, Loader2, HardDrive } from 'lucide-react';
import { useRootFolders } from '@/hooks/useFolders';
import { useStorageAnalytics } from '@/hooks/useAnalytics';
import { FolderTreeItem } from './FolderTreeItem';
import { CreateFolderModal } from './CreateFolderModal';
import { RenameFolderModal } from './RenameFolderModal';
import { MoveFolderModal } from './MoveFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { cn, formatFileSize } from '@/lib/utils';
import type { FolderResponse } from '@ong-chadia/shared';

interface FolderTreeProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function FolderTree({ selectedId, onSelect }: FolderTreeProps) {
  const { data: rootFolders, isLoading, error } = useRootFolders();
  const { data: storage } = useStorageAnalytics();

  // Storage data from API
  const storageUsed = storage?.used || 0;
  const storageQuota = storage?.quota || 5 * 1024 * 1024 * 1024; // Default 5GB
  const storagePercent = storage?.percentage || 0;

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
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Dossiers</h2>
        </div>
        <div className="p-4 text-sm text-red-600">
          Erreur lors du chargement des dossiers
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Dossiers</h2>
        <button
          onClick={() => setCreateModal({ open: true, parentId: null })}
          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          title="Nouveau dossier"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {/* Root / All documents option */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 mb-1',
            selectedId === null
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
          onClick={() => onSelect(null)}
        >
          <Home className={cn('w-4 h-4', selectedId === null ? 'text-primary-600' : 'text-slate-400')} />
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
          <div className="px-3 py-4 text-sm text-slate-500 text-center">
            Aucun dossier
          </div>
        )}
      </div>

      {/* Storage indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Stockage</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>{formatFileSize(storageUsed)} utilisés</span>
          <span className="font-medium text-slate-700">{storagePercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-500',
              storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-amber-500' : 'bg-primary-600'
            )}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400">{formatFileSize(storageQuota - storageUsed)} disponibles sur {formatFileSize(storageQuota)}</p>
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
