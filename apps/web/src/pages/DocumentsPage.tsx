import { useState, useCallback, lazy, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, FolderOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// Direct imports for critical path components (avoid barrel file)
import { FolderTree } from '@/components/documents/FolderTree';
import { FolderBreadcrumb } from '@/components/documents/FolderBreadcrumb';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { DocumentsToolbar } from '@/components/documents/DocumentsToolbar';
import { EmptyState } from '@/components/documents/EmptyState';
import { UploadDropzone } from '@/components/documents/UploadDropzone';
import { UploadProgress, type UploadItem } from '@/components/documents/UploadProgress';
import { TagCloud } from '@/components/documents/TagCloud';
// Lazy load heavy components (modals, drawer, viewer)
const RenameDocumentModal = lazy(() => import('@/components/documents/RenameDocumentModal').then(m => ({ default: m.RenameDocumentModal })));
const DeleteDocumentModal = lazy(() => import('@/components/documents/DeleteDocumentModal').then(m => ({ default: m.DeleteDocumentModal })));
const DocumentDrawer = lazy(() => import('@/components/documents/DocumentDrawer').then(m => ({ default: m.DocumentDrawer })));
const FullScreenViewer = lazy(() => import('@/components/documents/viewers/FullScreenViewer').then(m => ({ default: m.FullScreenViewer })));
import { useDocumentsByFolder } from '@/hooks/useDocuments';
import { documentsService } from '@/services/documents.service';
import { toast } from '@/hooks/useToast';
import type { DocumentResponse, DocumentListQueryParams } from '@ong-chadia/shared';

type SortField = 'name' | 'createdAt' | 'size';
type SortOrder = 'asc' | 'desc';

export default function DocumentsPage() {
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // Selection state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Upload state
  const [uploads, setUploads] = useState<UploadItem[]>([]);

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

  // Full screen preview state
  const [previewDocument, setPreviewDocument] = useState<DocumentResponse | null>(null);

  // Query
  const queryClient = useQueryClient();
  const params: DocumentListQueryParams = {
    sort: sortField,
    order: sortOrder,
  };
  const { data, isLoading, error } = useDocumentsByFolder(selectedFolderId, params);

  // Filter documents by search query
  const documents = data?.data || [];
  const filteredDocuments = searchQuery
    ? documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents;

  // Toggle document selection
  const toggleDocSelection = (id: string) => {
    const newSelected = new Set(selectedDocIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocIds(newSelected);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedDocIds(new Set());
  };

  // Handle sort change
  const handleSortChange = (field: SortField) => {
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
      if (!selectedFolderId) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner un dossier',
          variant: 'destructive',
        });
        return;
      }

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
          await documentsService.upload(upload.file, selectedFolderId, (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
            );
          });

          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id ? { ...u, status: 'complete', progress: 100 } : u
            )
          );

          // Refresh document list
          queryClient.invalidateQueries({ queryKey: ['documents', selectedFolderId] });

          toast({
            title: 'Succès',
            description: `${upload.file.name} téléversé`,
            variant: 'success',
          });
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
    [selectedFolderId, queryClient]
  );

  // Handle document actions
  const handleDocumentClick = (doc: DocumentResponse) => {
    // Open full screen preview directly (like Google Drive)
    setPreviewDocument(doc);
  };

  // Handle document details (right-click or menu)
  const handleDocumentDetails = (doc: DocumentResponse) => {
    setSelectedDocumentId(doc.id);
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const { url } = await documentsService.getDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le document',
        variant: 'destructive',
      });
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

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden w-full">
        {/* Folder Tree Panel */}
        <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden flex flex-col">
          {/* Folder header */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Dossiers</h2>
                <p className="text-xs text-gray-500">Organisez vos fichiers</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <FolderTree
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
            />
          </div>

          {/* Tag Cloud */}
          <div className="border-t border-gray-200 bg-gray-50">
            <TagCloud
              selectedTagId={selectedTagId}
              onTagClick={(tagId) => {
                setSelectedTagId(selectedTagId === tagId ? null : tagId);
              }}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
              {/* Header */}
              <header className="flex flex-col space-y-4 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        Documents
                      </h1>
                      <p className="text-sm text-gray-500">
                        Gérez et organisez vos fichiers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Breadcrumb */}
                <div className="card-simple px-4 py-2.5">
                  <FolderBreadcrumb
                    folderId={selectedFolderId}
                    onNavigate={setSelectedFolderId}
                  />
                </div>
              </header>

              {/* Upload Dropzone */}
              {selectedFolderId && (
                <div className="mb-6">
                  <UploadDropzone onFilesSelected={handleFilesSelected} />
                </div>
              )}

              {/* Toolbar */}
              <div>
                <DocumentsToolbar
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  selectedCount={selectedDocIds.size}
                  onClearSelection={clearSelection}
                />
              </div>

              {/* Content */}
              <div>
                {!selectedFolderId ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Sélectionnez un dossier
                    </h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      Choisissez un dossier dans le panneau de gauche pour voir et gérer vos documents
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="mt-4 text-gray-500">Chargement des documents...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                      <span className="text-xl text-red-600">!</span>
                    </div>
                    <p className="text-lg font-semibold text-red-600">Erreur de chargement</p>
                    <p className="text-sm text-gray-500 mt-1">{error.message}</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  searchQuery ? (
                    <EmptyState type="no-results" searchQuery={searchQuery} />
                  ) : (
                    <EmptyState
                      type="empty-folder"
                      onUploadClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          if (files.length > 0) {
                            handleFilesSelected(files);
                          }
                        };
                        input.click();
                      }}
                    />
                  )
                ) : viewMode === 'grid' ? (
                  <DocumentGrid
                    documents={filteredDocuments}
                    selectedIds={selectedDocIds}
                    onToggleSelect={toggleDocSelection}
                    onDocumentClick={handleDocumentClick}
                    onDownload={handleDownload}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onInfo={handleDocumentDetails}
                  />
                ) : (
                  <DocumentList folderId={selectedFolderId} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Upload Progress */}
      <UploadProgress uploads={uploads} onRemove={handleRemoveUpload} />

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

        {/* Full Screen Preview (opens on document click like Google Drive) */}
        {previewDocument && (
          <FullScreenViewer
            document={previewDocument}
            open={!!previewDocument}
            onClose={() => setPreviewDocument(null)}
            siblingDocuments={filteredDocuments}
            onNavigate={(doc) => setPreviewDocument(doc)}
          />
        )}
      </Suspense>
    </DashboardLayout>
  );
}
