import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, FolderOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  FolderTree,
  FolderBreadcrumb,
  DocumentList,
  DocumentGrid,
  DocumentsToolbar,
  EmptyState,
  UploadDropzone,
  UploadProgress,
  RenameDocumentModal,
  DeleteDocumentModal,
  DocumentDrawer,
  FullScreenViewer,
  TagCloud,
} from '@/components/documents';
import type { UploadItem } from '@/components/documents';
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
        {/* Folder Tree Panel - Obsidian Dark styled */}
        <aside className="w-72 bg-[#0d0d15] border-r border-white/[0.06] flex-shrink-0 overflow-hidden flex flex-col">
          {/* Folder header */}
          <div className="px-4 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/25">
                <FolderOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Dossiers</h2>
                <p className="text-xs text-slate-500">Organisez vos fichiers</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <FolderTree
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
            />
          </div>

          {/* Tag Cloud */}
          <div className="border-t border-white/[0.06] bg-[#0a0a0f]">
            <TagCloud
              selectedTagId={selectedTagId}
              onTagClick={(tagId) => {
                setSelectedTagId(selectedTagId === tagId ? null : tagId);
              }}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] h-full overflow-hidden relative">
          {/* Background glow effects */}
          <div className="absolute top-20 right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex-1 overflow-y-auto relative">
            <div className="max-w-7xl mx-auto px-6 py-6">
              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col space-y-4 pb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/25">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">
                          Documents
                        </h1>
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </div>
                      <p className="text-sm text-slate-400">
                        Gérez et organisez vos fichiers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Breadcrumb */}
                <div className="glass rounded-xl border border-white/[0.06] px-4 py-2.5">
                  <FolderBreadcrumb
                    folderId={selectedFolderId}
                    onNavigate={setSelectedFolderId}
                  />
                </div>
              </motion.header>

              {/* Upload Dropzone */}
              {selectedFolderId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <UploadDropzone onFilesSelected={handleFilesSelected} />
                </motion.div>
              )}

              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
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
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {!selectedFolderId ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
                      <FolderOpen className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Sélectionnez un dossier
                    </h3>
                    <p className="text-slate-400 text-center max-w-sm">
                      Choisissez un dossier dans le panneau de gauche pour voir et gérer vos documents
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
                    </div>
                    <p className="mt-4 text-slate-400">Chargement des documents...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                      <span className="text-2xl text-red-400">!</span>
                    </div>
                    <p className="text-lg font-semibold text-red-400">Erreur de chargement</p>
                    <p className="text-sm text-slate-400 mt-1">{error.message}</p>
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
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Upload Progress */}
      <UploadProgress uploads={uploads} onRemove={handleRemoveUpload} />

      {/* Modals */}
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
      <DocumentDrawer
        documentId={selectedDocumentId}
        open={!!selectedDocumentId}
        onClose={() => setSelectedDocumentId(null)}
      />

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
    </DashboardLayout>
  );
}
