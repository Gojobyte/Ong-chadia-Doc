import { useState, useEffect, useCallback } from 'react';
import { Trash2, FolderInput, Tag, X, CheckSquare, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentSelection } from '@/stores/document-selection.store';
import { BulkDeleteModal } from './BulkDeleteModal';
import { BulkMoveModal } from './BulkMoveModal';
import { BulkTagsModal } from './BulkTagsModal';
import { bulkDownload } from '@/services/bulk.service';
import { toast } from '@/hooks/useToast';

interface BulkActionsBarProps {
  allDocumentIds: string[];
}

export function BulkActionsBar({ allDocumentIds }: BulkActionsBarProps) {
  const { getSelectedCount, getSelectedIds, selectAll, deselectAll } = useDocumentSelection();
  const selectedCount = getSelectedCount();
  const selectedIds = getSelectedIds();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsDownloading(true);
    try {
      const result = await bulkDownload(selectedIds);

      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `documents-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Téléchargement réussi',
        description: `${result.fileCount} fichier(s) téléchargé(s)`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors du téléchargement',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [selectedIds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl+A / Cmd+A - Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll(allDocumentIds);
      }

      // Delete / Backspace - Open delete modal (only if something is selected)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCount > 0) {
        e.preventDefault();
        setShowDeleteModal(true);
      }

      // Escape - Deselect all
      if (e.key === 'Escape' && selectedCount > 0) {
        e.preventDefault();
        deselectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allDocumentIds, selectAll, deselectAll, selectedCount]);

  if (selectedCount === 0) {
    return null;
  }

  const allSelected = selectedCount === allDocumentIds.length && allDocumentIds.length > 0;

  return (
    <>
      <div className="sticky bottom-4 mx-auto w-fit z-50">
        <div className="bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => (allSelected ? deselectAll() : selectAll(allDocumentIds))}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              title={allSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
            >
              <CheckSquare className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700 hover:text-white"
              onClick={() => setShowMoveModal(true)}
            >
              <FolderInput className="w-4 h-4 mr-2" />
              Déplacer
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700 hover:text-white"
              onClick={handleBulkDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Télécharger
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700 hover:text-white"
              onClick={() => setShowTagsModal(true)}
            >
              <Tag className="w-4 h-4 mr-2" />
              Tags
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          {/* Close */}
          <button
            onClick={deselectAll}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <BulkDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        documentIds={selectedIds}
        onSuccess={deselectAll}
      />

      <BulkMoveModal
        open={showMoveModal}
        onOpenChange={setShowMoveModal}
        documentIds={selectedIds}
        onSuccess={deselectAll}
      />

      <BulkTagsModal
        open={showTagsModal}
        onOpenChange={setShowTagsModal}
        documentIds={selectedIds}
        onSuccess={() => {}}
      />
    </>
  );
}
