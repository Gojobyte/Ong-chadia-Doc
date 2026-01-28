import { useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfficeViewerProps {
  url: string;
  fileName: string;
  mimeType: string;
  onDownload?: () => void;
}

export function OfficeViewer({ url, fileName, mimeType, onDownload }: OfficeViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use Google Docs Viewer for Office files
  // Note: This requires the file URL to be publicly accessible
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  const getFileTypeLabel = () => {
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return 'Document Word';
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return 'Feuille Excel';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'Présentation PowerPoint';
    }
    return 'Document Office';
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-8">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>

        <h3 className="text-lg font-medium mb-2">{getFileTypeLabel()}</h3>
        <p className="text-white/60 text-sm text-center mb-6 max-w-md">
          La prévisualisation de ce type de fichier n'est pas disponible.
          Téléchargez le fichier pour l'ouvrir dans l'application appropriée.
        </p>

        <div className="flex gap-3">
          {onDownload && (
            <Button
              onClick={onDownload}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => window.open(url, '_blank')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ouvrir dans un nouvel onglet
          </Button>
        </div>

        <p className="text-white/40 text-xs mt-6">
          {fileName}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-sm">Chargement de la prévisualisation...</p>
        </div>
      )}

      <iframe
        src={viewerUrl}
        title={fileName}
        className="flex-1 w-full border-0 bg-white rounded-lg"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />

      {/* Fallback message */}
      <div className="flex items-center justify-center gap-4 py-3 bg-slate-800/80 backdrop-blur-sm rounded-b-lg">
        <p className="text-slate-400 text-sm">
          Problème d'affichage ?
        </p>
        {onDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="text-primary-400 hover:text-primary-300 hover:bg-primary-400/10"
          >
            <Download className="w-4 h-4 mr-1" />
            Télécharger
          </Button>
        )}
      </div>
    </div>
  );
}
