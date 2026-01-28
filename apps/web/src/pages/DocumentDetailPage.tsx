import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VersionHistory } from '@/components/documents/VersionHistory';
import { FullScreenViewer } from '@/components/documents/viewers/FullScreenViewer';
import { ShareButton } from '@/components/documents/ShareButton';
import { CommentSection } from '@/components/documents/CommentSection';
import { useDocument, useDocumentDownloadUrl } from '@/hooks/useDocuments';
import { documentsService } from '@/services/documents.service';
import { formatDate, formatFileSize } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import {
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  User,
  Folder,
  FileText,
  File,
  Image,
  Table2,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Star,
  Eye,
} from 'lucide-react';

// File type icons based on mime type
function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return <FileText className="w-8 h-8 text-red-500" />;
  }
  if (mimeType.includes('image')) {
    return <Image className="w-8 h-8 text-purple-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <Table2 className="w-8 h-8 text-green-500" />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="w-8 h-8 text-blue-500" />;
  }
  return <File className="w-8 h-8 text-slate-400" />;
}

// Get file type label
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'Image JPEG';
  if (mimeType.includes('png')) return 'Image PNG';
  if (mimeType.includes('gif')) return 'Image GIF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Document Word';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Feuille Excel';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Présentation';
  if (mimeType.includes('text/plain')) return 'Fichier texte';
  return mimeType.split('/')[1]?.toUpperCase() || 'Fichier';
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewVersionNumber, setPreviewVersionNumber] = useState<number | null>(null);

  // Fetch document data
  const { data: document, isLoading, error } = useDocument(id || null);
  const { data: urlData } = useDocumentDownloadUrl(id || null);

  // Handle download
  const handleDownload = async () => {
    if (!id) return;
    try {
      const { url } = await documentsService.getDownloadUrl(id);
      window.open(url, '_blank');
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le fichier',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id || !document) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${document.name}" ?`)) return;

    try {
      await documentsService.delete(id);
      toast({
        title: 'Succès',
        description: 'Document supprimé',
        variant: 'success',
      });
      navigate('/documents');
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document',
        variant: 'destructive',
      });
    }
  };

  // Handle version preview
  const handlePreviewVersion = (url: string, versionNumber: number) => {
    setPreviewUrl(url);
    setPreviewVersionNumber(versionNumber);
    setFullscreenOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-slate-500">Chargement du document...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Document non trouvé
            </h2>
            <p className="text-slate-500 mb-6">
              Ce document n'existe pas ou vous n'avez pas les permissions pour y accéder.
            </p>
            <Button onClick={() => navigate('/documents')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux documents
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentUrl = urlData?.url || document.url;

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Header Navigation */}
          <div className="flex items-center gap-4">
            <Link to="/documents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux documents
              </Button>
            </Link>
          </div>

          {/* Title & Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(document.mimeType)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 break-words">
                    {document.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Badge variant="neutral">
                      {getFileTypeLabel(document.mimeType)}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {formatFileSize(document.size)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFullscreenOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Prévisualiser
                </Button>
                <ShareButton documentId={document.id} />
                <Button size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Preview Card */}
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Aperçu</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFullscreenOpen(true)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Plein écran
                  </Button>
                </div>
                <div className="relative bg-slate-100 min-h-[400px]">
                  {/* Preview based on file type */}
                  {document.mimeType.startsWith('image/') && currentUrl ? (
                    <div className="flex items-center justify-center p-4">
                      <img
                        src={currentUrl}
                        alt={document.name}
                        className="max-h-[400px] max-w-full object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  ) : document.mimeType === 'application/pdf' && currentUrl ? (
                    <iframe
                      src={`${currentUrl}#view=FitH`}
                      className="w-full h-[500px] border-0"
                      title={document.name}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                      <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                        {getFileIcon(document.mimeType)}
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {document.name}
                      </h3>
                      <p className="text-slate-500 mb-4 max-w-md">
                        L'aperçu en ligne n'est pas disponible pour ce type de fichier.
                        Cliquez sur "Plein écran" ou téléchargez le fichier pour le visualiser.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setFullscreenOpen(true)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir en plein écran
                        </Button>
                        <Button onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Version History */}
              <Card className="p-4">
                <VersionHistory
                  documentId={document.id}
                  documentName={document.name}
                  onPreviewVersion={handlePreviewVersion}
                />
              </Card>

              {/* Comments Section */}
              <Card className="p-4">
                <CommentSection documentId={document.id} />
              </Card>
            </div>

            {/* Sidebar - Metadata */}
            <div className="space-y-6">
              {/* Details Card */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Informations
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Type de fichier</p>
                      <p className="text-sm font-medium text-slate-900">
                        {getFileTypeLabel(document.mimeType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <File className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Taille</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatFileSize(document.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Date de création</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(document.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Téléversé par</p>
                      <p className="text-sm font-medium text-slate-900">
                        ID: {document.uploadedById}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Folder className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Dossier</p>
                      <Link
                        to={`/documents?folderId=${document.folderId}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        Voir le dossier
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Actions rapides
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-3" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setFullscreenOpen(true)}
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    Prévisualiser
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Star className="w-4 h-4 mr-3" />
                    Ajouter aux favoris
                  </Button>
                </div>
              </Card>

              {/* Technical Info */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Informations techniques
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID Document</span>
                    <span className="font-mono text-slate-700 truncate max-w-[150px]" title={document.id}>
                      {document.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type MIME</span>
                    <span className="font-mono text-slate-700 truncate max-w-[150px]" title={document.mimeType}>
                      {document.mimeType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID Dossier</span>
                    <span className="font-mono text-slate-700 truncate max-w-[150px]" title={document.folderId}>
                      {document.folderId}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Viewer */}
      {document && (
        <FullScreenViewer
          document={{
            ...document,
            url: previewUrl || currentUrl,
          }}
          open={fullscreenOpen}
          onClose={() => {
            setFullscreenOpen(false);
            setPreviewUrl(null);
            setPreviewVersionNumber(null);
          }}
        />
      )}

      {/* Version number indicator when viewing a specific version */}
      {fullscreenOpen && previewVersionNumber && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Vous visualisez la version {previewVersionNumber}
        </div>
      )}
    </DashboardLayout>
  );
}
