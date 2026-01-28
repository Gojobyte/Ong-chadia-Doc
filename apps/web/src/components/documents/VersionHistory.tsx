import { useState, useRef } from 'react';
import { Download, History, Upload, Loader2, RotateCcw, AlertCircle, Eye } from 'lucide-react';
import { useDocumentVersions, useUploadVersion, useRestoreVersion } from '@/hooks/useDocuments';
import { documentsService } from '@/services/documents.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatFileSize } from '@/lib/utils';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@ong-chadia/shared';
import { toast } from '@/hooks/useToast';

interface VersionHistoryProps {
  documentId: string;
  documentName?: string;
  onPreviewVersion?: (versionUrl: string, versionNumber: number) => void;
}

export function VersionHistory({ documentId, onPreviewVersion }: VersionHistoryProps) {
  const { data, isLoading, error } = useDocumentVersions(documentId);
  const uploadVersion = useUploadVersion();
  const restoreVersion = useRestoreVersion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewingVersion, setPreviewingVersion] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Fichier trop volumineux',
        description: `La taille maximale est de ${MAX_FILE_SIZE / (1024 * 1024)} Mo`,
        variant: 'destructive',
      });
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      toast({
        title: 'Type de fichier non supporté',
        description: 'Veuillez utiliser un fichier PDF, Word, Excel, image ou texte',
        variant: 'destructive',
      });
      return;
    }

    // Upload
    setUploadProgress(0);
    try {
      await uploadVersion.mutateAsync({
        documentId,
        file,
        onProgress: setUploadProgress,
      });
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleDownloadVersion = async (versionId: string) => {
    try {
      const { url } = await documentsService.getVersionDownloadUrl(documentId, versionId);
      window.open(url, '_blank');
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger cette version',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    await restoreVersion.mutateAsync({ documentId, versionId });
  };

  const handlePreviewVersion = async (versionId: string, versionNumber: number) => {
    if (!onPreviewVersion) return;

    setPreviewingVersion(versionId);
    try {
      const { url } = await documentsService.getVersionDownloadUrl(documentId, versionId);
      onPreviewVersion(url, versionNumber);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la prévisualisation',
        variant: 'destructive',
      });
    } finally {
      setPreviewingVersion(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
        <p className="text-sm">Erreur lors du chargement des versions</p>
      </div>
    );
  }

  // Sort versions: current version first, then by version number descending
  const versions = [...(data?.versions || [])].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return b.versionNumber - a.versionNumber;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4" />
          Versions ({versions.length})
        </h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_MIME_TYPES.join(',')}
            onChange={handleFileSelect}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUploadClick}
            disabled={uploadProgress !== null}
          >
            {uploadProgress !== null ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Nouvelle version
              </>
            )}
          </Button>
        </div>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          Aucune version disponible
        </p>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                version.isCurrent
                  ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-100'
                  : 'bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-medium ${
                    version.isCurrent ? 'text-primary-700' : 'text-slate-700'
                  }`}>
                    v{version.versionNumber}
                  </span>
                  {version.isCurrent && (
                    <Badge variant="success" className="text-xs">
                      Courante
                    </Badge>
                  )}
                </div>
                {version.name && (
                  <p className="text-xs text-slate-600 truncate mt-0.5" title={version.name}>
                    {version.name}
                  </p>
                )}
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatFileSize(version.size)} • {formatDate(version.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onPreviewVersion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePreviewVersion(version.id, version.versionNumber)}
                    disabled={previewingVersion === version.id}
                    title="Prévisualiser cette version"
                  >
                    {previewingVersion === version.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDownloadVersion(version.id)}
                  title="Télécharger cette version"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {!version.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleRestoreVersion(version.id)}
                    disabled={restoreVersion.isPending}
                    title="Restaurer cette version"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restaurer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
