import { useState, useEffect } from 'react';
import {
  Download,
  Pencil,
  FolderInput,
  Trash2,
  Loader2,
  FileText,
  Calendar,
  HardDrive,
  Folder,
  X,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDocument, useDocumentDownloadUrl } from '@/hooks/useDocuments';
import { useFolder } from '@/hooks/useFolders';
import { documentsService } from '@/services/documents.service';
import { VersionHistory } from './VersionHistory';
import { ShareButton } from './ShareButton';
import { ShareLinksManager } from './ShareLinksManager';
import { AccessLogs } from './AccessLogs';
import { RenameDocumentModal } from './RenameDocumentModal';
import { MoveDocumentModal } from './MoveDocumentModal';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { formatFileSize, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/auth.store';
import { useIsDocumentFavorite, useToggleDocumentFavorite } from '@/hooks/useFavorites';
import { useDocumentTags, useAddDocumentTags, useRemoveDocumentTag } from '@/hooks/useTags';
import { TagInput } from '@/components/ui/tag-input';
import { MetadataEditor } from './MetadataEditor';

interface DocumentDrawerProps {
  documentId: string | null;
  open: boolean;
  onClose: () => void;
}

// Check if document can be previewed
function canPreview(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  );
}

export function DocumentDrawer({ documentId, open, onClose }: DocumentDrawerProps) {
  const { data: doc, isLoading, error } = useDocument(documentId);
  const { data: urlData } = useDocumentDownloadUrl(documentId);
  const { data: folder } = useFolder(doc?.folderId ?? null);
  const user = useAuthStore((state) => state.user);

  // Favorites
  const { data: isFavorite } = useIsDocumentFavorite(documentId);
  const { toggle: toggleFavorite, isLoading: favoriteLoading } = useToggleDocumentFavorite();

  // Tags
  const { data: documentTags = [] } = useDocumentTags(documentId);
  const addTagsMutation = useAddDocumentTags();
  const removeTagMutation = useRemoveDocumentTag();

  // Modal states
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);

  // Version preview state
  const [versionPreviewUrl, setVersionPreviewUrl] = useState<string | null>(null);
  const [versionPreviewNumber, setVersionPreviewNumber] = useState<number | null>(null);

  // Check if user can share (Staff or Super-Admin)
  const canShare = user?.role === 'SUPER_ADMIN' || user?.role === 'STAFF';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Reset preview loading and version preview when document changes
  useEffect(() => {
    setPreviewLoading(true);
    setVersionPreviewUrl(null);
    setVersionPreviewNumber(null);
  }, [documentId]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      window.document.body.style.overflow = 'hidden';
    } else {
      window.document.body.style.overflow = '';
    }
    return () => {
      window.document.body.style.overflow = '';
    };
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') onClose();
      // S key to toggle favorite
      if (e.key === 's' || e.key === 'S') {
        if (documentId && !favoriteLoading) {
          e.preventDefault();
          toggleFavorite(documentId, isFavorite || false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, documentId, isFavorite, toggleFavorite, favoriteLoading]);

  const handleDownload = async () => {
    if (!doc) return;
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

  const handleDeleteSuccess = () => {
    setDeleteOpen(false);
    onClose();
  };

  const handlePreviewVersion = (url: string, versionNumber: number) => {
    setVersionPreviewUrl(url);
    setVersionPreviewNumber(versionNumber);
    setPreviewLoading(true);
  };

  const handleClearVersionPreview = () => {
    setVersionPreviewUrl(null);
    setVersionPreviewNumber(null);
    setPreviewLoading(true);
  };

  if (!open) return null;

  // Get file extension and preview URL
  const extension = doc?.name?.split('.').pop()?.toUpperCase() || '';
  const currentPreviewUrl = versionPreviewUrl || urlData?.url || doc?.url;
  const mimeType = doc?.mimeType || '';
  const hasPreview = mimeType && canPreview(mimeType);

  // Generate Google Docs Viewer URL for Office documents
  const getViewerUrl = () => {
    if (!currentPreviewUrl) return null;
    if (mimeType.startsWith('image/')) return currentPreviewUrl;
    if (mimeType === 'application/pdf') return `${currentPreviewUrl}#view=FitH`;
    // Office documents use Google Docs Viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(currentPreviewUrl)}&embedded=true`;
  };

  const viewerUrl = getViewerUrl();

  return (
    <>
      {/* Full-screen overlay with split layout */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
        <div className="h-full flex">
          {/* Left Panel - Info (scrollable) */}
          <div className="w-[380px] bg-white h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 truncate flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{doc?.name || 'Document'}</span>
              </h2>
              <div className="flex items-center gap-1">
                {/* Favorite button */}
                {documentId && (
                  <button
                    onClick={() => toggleFavorite(documentId, isFavorite || false)}
                    disabled={favoriteLoading}
                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                      isFavorite
                        ? 'text-amber-500 hover:bg-amber-50'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                    } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorite ? 'Retirer des favoris (S)' : 'Ajouter aux favoris (S)'}
                  >
                    <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                  <p className="text-lg font-medium">Erreur de chargement</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              ) : doc ? (
                <div className="space-y-5">
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    {canShare && <ShareButton documentId={doc.id} />}
                    <Button variant="secondary" size="sm" onClick={() => setRenameOpen(true)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Renommer
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setMoveOpen(true)}>
                      <FolderInput className="w-4 h-4 mr-2" />
                      Déplacer
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>

                  <Separator />

                  {/* Document Info */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">Informations</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <dt className="flex items-center gap-2 text-slate-500 w-24">
                          <FileText className="w-4 h-4" />
                          Type
                        </dt>
                        <dd className="text-slate-900 font-medium">{extension}</dd>
                      </div>
                      <div className="flex items-center gap-3">
                        <dt className="flex items-center gap-2 text-slate-500 w-24">
                          <HardDrive className="w-4 h-4" />
                          Taille
                        </dt>
                        <dd className="text-slate-900">{formatFileSize(doc.size)}</dd>
                      </div>
                      <div className="flex items-center gap-3">
                        <dt className="flex items-center gap-2 text-slate-500 w-24">
                          <Calendar className="w-4 h-4" />
                          Créé le
                        </dt>
                        <dd className="text-slate-900">{formatDate(doc.createdAt)}</dd>
                      </div>
                      <div className="flex items-center gap-3">
                        <dt className="flex items-center gap-2 text-slate-500 w-24">
                          <Folder className="w-4 h-4" />
                          Dossier
                        </dt>
                        <dd className="text-slate-900">{folder?.name || 'Racine'}</dd>
                      </div>
                    </dl>
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">Tags</h3>
                    <TagInput
                      value={documentTags}
                      onChange={(newTags) => {
                        // Find added tags
                        const addedTags = newTags.filter(
                          (t) => !documentTags.some((dt) => dt.id === t.id)
                        );
                        // Find removed tags
                        const removedTags = documentTags.filter(
                          (dt) => !newTags.some((t) => t.id === dt.id)
                        );

                        // Process additions
                        if (addedTags.length > 0) {
                          const existingTagIds = addedTags
                            .filter((t) => !t.id.startsWith('new-'))
                            .map((t) => t.id);
                          const newTagNames = addedTags
                            .filter((t) => t.id.startsWith('new-'))
                            .map((t) => t.name);

                          addTagsMutation.mutate({
                            documentId: doc.id,
                            tagIds: existingTagIds.length > 0 ? existingTagIds : undefined,
                            tagNames: newTagNames.length > 0 ? newTagNames : undefined,
                          });
                        }

                        // Process removals
                        removedTags.forEach((tag) => {
                          removeTagMutation.mutate({
                            documentId: doc.id,
                            tagId: tag.id,
                          });
                        });
                      }}
                      placeholder="Ajouter des tags..."
                    />
                  </div>

                  <Separator />

                  {/* Metadata */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">Métadonnées</h3>
                    <MetadataEditor documentId={doc.id} folderId={doc.folderId} />
                  </div>

                  <Separator />

                  {/* Versions */}
                  <VersionHistory
                    documentId={doc.id}
                    documentName={doc.name}
                    onPreviewVersion={handlePreviewVersion}
                  />

                  {/* Share Links */}
                  {canShare && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="font-medium text-slate-900">Liens de partage</h3>
                        <ShareLinksManager documentId={doc.id} />
                      </div>
                    </>
                  )}

                  {/* Access Logs */}
                  {isSuperAdmin && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="font-medium text-slate-900">Journal d'accès</h3>
                        <AccessLogs documentId={doc.id} />
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Panel - Preview (full height) */}
          <div className="flex-1 bg-slate-900 flex flex-col p-6">
            {/* Version indicator */}
            {versionPreviewNumber !== null && (
              <div className="flex items-center justify-between mb-4 px-4 py-2 bg-primary-600 rounded-lg">
                <span className="text-white text-sm font-medium">
                  Prévisualisation de la version {versionPreviewNumber}
                </span>
                <button
                  onClick={handleClearVersionPreview}
                  className="text-white/80 hover:text-white text-sm underline"
                >
                  Voir version courante
                </button>
              </div>
            )}

            <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center text-white">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-white/60">Chargement...</p>
              </div>
            ) : !hasPreview ? (
              <div className="flex flex-col items-center text-white">
                <FileText className="w-20 h-20 text-white/30 mb-4" />
                <p className="text-white/60">Aperçu non disponible pour ce type de fichier</p>
                <Button
                  onClick={handleDownload}
                  className="mt-4 bg-primary-600 hover:bg-primary-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            ) : viewerUrl ? (
              <div className="w-full h-full flex flex-col">
                {/* Preview loading indicator */}
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <div className="flex flex-col items-center text-white">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p className="text-white/60">Chargement de l'aperçu...</p>
                    </div>
                  </div>
                )}

                {/* Preview content */}
                {mimeType.startsWith('image/') ? (
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={viewerUrl}
                      alt={doc?.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onLoad={() => setPreviewLoading(false)}
                    />
                  </div>
                ) : (
                  <iframe
                    src={viewerUrl}
                    title={doc?.name}
                    className="w-full h-full rounded-lg bg-white"
                    onLoad={() => setPreviewLoading(false)}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-white">
                <FileText className="w-20 h-20 text-white/30 mb-4" />
                <p className="text-white/60">URL de prévisualisation non disponible</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {doc && (
        <>
          <RenameDocumentModal
            open={renameOpen}
            document={doc}
            onClose={() => setRenameOpen(false)}
          />
          <MoveDocumentModal
            open={moveOpen}
            document={doc}
            onClose={() => setMoveOpen(false)}
          />
          <DeleteDocumentModal
            open={deleteOpen}
            document={doc}
            onClose={handleDeleteSuccess}
          />
        </>
      )}
    </>
  );
}
