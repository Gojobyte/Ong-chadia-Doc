import { useState, useRef } from 'react';
import { Download, History, Upload, Loader2, RotateCcw } from 'lucide-react';
import { useDocumentVersions, useUploadVersion, useRestoreVersion } from '@/hooks/useDocuments';
import { documentsService } from '@/services/documents.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatFileSize } from '@/lib/utils';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@ong-chadia/shared';
import { toast } from '@/hooks/useToast';

interface VersionHistoryProps {
  documentId: string;
  documentName: string;
}

export function VersionHistory({ documentId, documentName }: VersionHistoryProps) {
  const { data, isLoading } = useDocumentVersions(documentId);
  const uploadVersion = useUploadVersion();
  const restoreVersion = useRestoreVersion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const versions = data?.versions || [];

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
              className="flex items-center justify-between p-3 border rounded-lg bg-white"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium text-slate-700">
                  v{version.versionNumber}
                </span>
                {version.isCurrent && (
                  <Badge variant="success" className="text-xs">
                    Courante
                  </Badge>
                )}
              </div>

              <div className="text-sm text-slate-500">
                {formatFileSize(version.size)} • {formatDate(version.createdAt)}
              </div>

              <div className="flex items-center gap-1">
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
