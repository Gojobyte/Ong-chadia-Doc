import { useState } from 'react';
import { FileText, File, Image, Table2, Loader2, Maximize2 } from 'lucide-react';
import { useDocumentDownloadUrl } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import type { DocumentResponse } from '@ong-chadia/shared';

// File type icons
const FILE_TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'application/pdf': FileText,
  'application/msword': File,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': File,
  'application/vnd.ms-excel': Table2,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': Table2,
  'image/jpeg': Image,
  'image/png': Image,
  'image/gif': Image,
  'text/plain': FileText,
};

// Check if mime type is an Office document
function isOfficeDocument(mimeType: string): boolean {
  return (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  );
}

// Fullscreen button component - defined outside render
function FullscreenButton({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm z-10"
    >
      <Maximize2 className="w-4 h-4 mr-1" />
      Plein écran
    </Button>
  );
}

interface DocumentPreviewProps {
  document: DocumentResponse;
  onOpenFullscreen?: () => void;
}

export function DocumentPreview({ document, onOpenFullscreen }: DocumentPreviewProps) {
  const { data: urlData, isLoading } = useDocumentDownloadUrl(document.id);
  const [iframeLoading, setIframeLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="border rounded-lg h-48 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const url = urlData?.url || document.url;
  const mimeType = document.mimeType || '';

  // Check if preview is available for fullscreen
  const hasPreview =
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    isOfficeDocument(mimeType);

  const fullscreenHandler = hasPreview ? onOpenFullscreen : undefined;

  // Images
  if (mimeType.startsWith('image/') && url) {
    return (
      <div className="relative group border rounded-lg overflow-hidden bg-slate-50 cursor-pointer" onClick={fullscreenHandler}>
        <img
          src={url}
          alt={document.name}
          className="max-h-48 mx-auto object-contain"
        />
        <FullscreenButton onClick={fullscreenHandler} />
      </div>
    );
  }

  // PDF (basic iframe preview)
  if (mimeType === 'application/pdf' && url) {
    return (
      <div className="relative group border rounded-lg overflow-hidden h-48">
        <iframe
          src={`${url}#view=FitH`}
          className="w-full h-full"
          title={document.name}
        />
        <FullscreenButton onClick={fullscreenHandler} />
      </div>
    );
  }

  // Office documents (Word, Excel, PowerPoint) - Use Google Docs Viewer
  if (isOfficeDocument(mimeType) && url) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
      <div className="relative group border rounded-lg overflow-hidden h-64 bg-white">
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
            <span className="text-xs text-slate-500">Chargement de l'aperçu...</span>
          </div>
        )}
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title={document.name}
          onLoad={() => setIframeLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        <FullscreenButton onClick={fullscreenHandler} />
      </div>
    );
  }

  // Fallback - show file type icon
  const IconComponent = FILE_TYPE_ICONS[mimeType] || File;

  return (
    <div
      className="relative group border rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={fullscreenHandler}
    >
      <IconComponent className="w-16 h-16 text-slate-300" />
      <span className="mt-2 text-sm text-slate-500">
        {hasPreview ? 'Cliquez pour voir en plein écran' : 'Aperçu non disponible'}
      </span>
      <FullscreenButton onClick={fullscreenHandler} />
    </div>
  );
}
