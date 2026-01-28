import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronUp, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { useDocumentsByFolder } from '@/hooks/useDocuments';
import { documentsService } from '@/services/documents.service';
import { DocumentRow } from './DocumentRow';
import { UploadButton } from './UploadButton';
import { DropZone } from './DropZone';
import { UploadProgress, type UploadItem } from './UploadProgress';
import { BulkActionsBar } from './BulkActionsBar';
import { Checkbox } from '@/components/ui/checkbox';
import { useDocumentSelection } from '@/stores/document-selection.store';
import type { DocumentResponse, DocumentListQueryParams } from '@ong-chadia/shared';

// Lazy load modal components
const RenameDocumentModal = lazy(() => import('./RenameDocumentModal').then(m => ({ default: m.RenameDocumentModal })));
const DeleteDocumentModal = lazy(() => import('./DeleteDocumentModal').then(m => ({ default: m.DeleteDocumentModal })));
const DocumentDrawer = lazy(() => import('./DocumentDrawer').then(m => ({ default: m.DocumentDrawer })));

interface DocumentListProps {
  folderId: string | null;
}

type SortField = 'name' | 'createdAt' | 'size';
type SortOrder = 'asc' | 'desc';

export function DocumentList({ folderId }: DocumentListProps) {
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Upload state
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // Selection state
  const { deselectAll, getSelectedCount, selectAll } = useDocumentSelection();

  // Clear selection when folder changes
  useEffect(() => {
    deselectAll();
  }, [folderId, deselectAll]);

  // Modal state
  const [renameModal, setRenameModal] = useState<{
    open: boolean;
    document: DocumentResponse | null;
  }>({ open: false, document: null });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    document: DocumentResponse | null;
  }>({ open: false, document: null });

  // Drawer state
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Queries
  const params: DocumentListQueryParams = {
    sort: sortField,
    order: sortOrder,
  };
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useDocumentsByFolder(folderId, params);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Handle file upload
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!folderId) return;

      // Create upload items
      const newUploads: UploadItem[] = files.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Upload files sequentially
      for (const upload of newUploads) {
        setUploads((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: 'uploading' } : u))
        );

        try {
          await documentsService.upload(upload.file, folderId, (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
            );
          });

          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id ? { ...u, status: 'complete', progress: 100 } : u
            )
          );

          // Refresh document list (invalidate cache, don't re-upload)
          queryClient.invalidateQueries({ queryKey: ['documents', folderId] });
        } catch (err) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? {
                    ...u,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Erreur de téléversement',
                  }
                : u
            )
          );
        }
      }

      // Remove completed uploads after delay
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.status !== 'complete'));
      }, 3000);
    },
    [folderId, queryClient]
  );

  // Handle document actions
  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const { url } = await documentsService.getDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch {
      // Error handled by service
    }
  };

  const handleRename = (doc: DocumentResponse) => {
    setRenameModal({ open: true, document: doc });
  };

  const handleDelete = (doc: DocumentResponse) => {
    setDeleteModal({ open: true, document: doc });
  };

  const handleRemoveUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  // Render sort header
  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <th
      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortOrder === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  );

  // Empty state when no folder selected
  if (!folderId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <FileText className="w-12 h-12 mb-4 text-slate-300" />
        <p className="text-lg font-medium">Sélectionnez un dossier</p>
        <p className="text-sm">Choisissez un dossier dans l'arborescence pour voir ses documents</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-500">
        <p className="text-lg font-medium">Erreur de chargement</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  const documents = data?.data || [];
  const allDocumentIds = documents.map((d) => d.id);
  const selectedCount = getSelectedCount();
  const allSelected = selectedCount === documents.length && documents.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < documents.length;

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll(allDocumentIds);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Documents {documents.length > 0 && `(${documents.length})`}
        </h2>
        <UploadButton onSelect={handleFilesSelected} />
      </div>

      {/* Document table with drop zone */}
      <DropZone onDrop={handleFilesSelected}>
        {documents.length > 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <Checkbox
                      checked={allSelected}
                      ref={(ref) => {
                        if (ref) {
                          (ref as unknown as HTMLInputElement).indeterminate = someSelected;
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                    />
                  </th>
                  <SortHeader field="name">Nom</SortHeader>
                  <th className="px-4 py-3">Type</th>
                  <SortHeader field="size">Taille</SortHeader>
                  <SortHeader field="createdAt">Date</SortHeader>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onClick={(d) => setSelectedDocumentId(d.id)}
                    onDownload={handleDownload}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    selectable={true}
                    allDocumentIds={allDocumentIds}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">Aucun document</p>
            <p className="text-sm text-slate-500 mb-4">
              Ce dossier est vide. Téléversez des fichiers pour commencer.
            </p>
            <UploadButton onSelect={handleFilesSelected} />
          </div>
        )}
      </DropZone>

      {/* Upload progress */}
      <UploadProgress
        uploads={uploads}
        onRemove={handleRemoveUpload}
      />

      {/* Lazy-loaded Modals */}
      <Suspense fallback={null}>
        {renameModal.document && (
          <RenameDocumentModal
            open={renameModal.open}
            document={renameModal.document}
            onClose={() => setRenameModal({ open: false, document: null })}
          />
        )}

        {deleteModal.document && (
          <DeleteDocumentModal
            open={deleteModal.open}
            document={deleteModal.document}
            onClose={() => setDeleteModal({ open: false, document: null })}
          />
        )}

        {/* Document Details Drawer */}
        {selectedDocumentId && (
          <DocumentDrawer
            documentId={selectedDocumentId}
            open={!!selectedDocumentId}
            onClose={() => setSelectedDocumentId(null)}
          />
        )}
      </Suspense>

      {/* Bulk Actions Bar */}
      <BulkActionsBar allDocumentIds={allDocumentIds} />
    </div>
  );
}
