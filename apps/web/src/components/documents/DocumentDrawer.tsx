import { useState } from 'react';
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
  User,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { documentsService } from '@/services/documents.service';
import { DocumentPreview } from './DocumentPreview';
import { VersionHistory } from './VersionHistory';
import { ShareButton } from './ShareButton';
import { ShareLinksManager } from './ShareLinksManager';
import { AccessLogs } from './AccessLogs';
import { RenameDocumentModal } from './RenameDocumentModal';
import { MoveDocumentModal } from './MoveDocumentModal';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { formatFileSize, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';

interface DocumentDrawerProps {
  documentId: string | null;
  open: boolean;
  onClose: () => void;
}

export function DocumentDrawer({ documentId, open, onClose }: DocumentDrawerProps) {
  const { data: document, isLoading, error } = useDocument(documentId);
  const user = useAuthStore((state) => state.user);

  // Modal states
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Check if user can share (Staff or Super-Admin)
  const canShare = user?.role === 'SUPER_ADMIN' || user?.role === 'STAFF';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleDownload = async () => {
    if (!document) return;
    try {
      const { url } = await documentsService.getDownloadUrl(document.id);
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

  // Get file extension
  const extension = document?.name.split('.').pop()?.toUpperCase() || '';

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <p className="text-lg font-medium">Erreur de chargement</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : document ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg pr-8">
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{document.name}</span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Preview */}
                <DocumentPreview document={document} />

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  {canShare && <ShareButton documentId={document.id} />}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRenameOpen(true)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Renommer
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMoveOpen(true)}
                  >
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
                      <dd className="text-slate-900">{extension}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <dt className="flex items-center gap-2 text-slate-500 w-24">
                        <HardDrive className="w-4 h-4" />
                        Taille
                      </dt>
                      <dd className="text-slate-900">{formatFileSize(document.size)}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <dt className="flex items-center gap-2 text-slate-500 w-24">
                        <Calendar className="w-4 h-4" />
                        Créé le
                      </dt>
                      <dd className="text-slate-900">{formatDate(document.createdAt)}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <dt className="flex items-center gap-2 text-slate-500 w-24">
                        <Folder className="w-4 h-4" />
                        Dossier
                      </dt>
                      <dd className="text-slate-900">{document.folderId}</dd>
                    </div>
                  </dl>
                </div>

                <Separator />

                {/* Versions */}
                <VersionHistory documentId={document.id} documentName={document.name} />

                {/* Share Links - visible to Staff and Super-Admin */}
                {canShare && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-medium text-slate-900">Liens de partage</h3>
                      <ShareLinksManager documentId={document.id} />
                    </div>
                  </>
                )}

                {/* Access Logs - visible to Super-Admin only */}
                {isSuperAdmin && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-medium text-slate-900">Journal d'accès</h3>
                      <AccessLogs documentId={document.id} />
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Modals */}
      {document && (
        <>
          <RenameDocumentModal
            open={renameOpen}
            document={document}
            onClose={() => setRenameOpen(false)}
          />
          <MoveDocumentModal
            open={moveOpen}
            document={document}
            onClose={() => setMoveOpen(false)}
          />
          <DeleteDocumentModal
            open={deleteOpen}
            document={document}
            onClose={handleDeleteSuccess}
          />
        </>
      )}
    </>
  );
}
