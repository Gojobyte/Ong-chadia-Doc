import { FileText, File, Image, Table2, Loader2 } from 'lucide-react';
import { useDocumentDownloadUrl } from '@/hooks/useDocuments';
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

interface DocumentPreviewProps {
  document: DocumentResponse;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const { data: urlData, isLoading } = useDocumentDownloadUrl(document.id);

  if (isLoading) {
    return (
      <div className="border rounded-lg h-48 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const url = urlData?.url || document.url;

  // Images
  if (document.mimeType.startsWith('image/') && url) {
    return (
      <div className="border rounded-lg overflow-hidden bg-slate-50">
        <img
          src={url}
          alt={document.name}
          className="max-h-48 mx-auto object-contain"
        />
      </div>
    );
  }

  // PDF (basic iframe preview)
  if (document.mimeType === 'application/pdf' && url) {
    return (
      <div className="border rounded-lg overflow-hidden h-48">
        <iframe
          src={`${url}#view=FitH`}
          className="w-full h-full"
          title={document.name}
        />
      </div>
    );
  }

  // Fallback - show file type icon
  const IconComponent = FILE_TYPE_ICONS[document.mimeType] || File;

  return (
    <div className="border rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50">
      <IconComponent className="w-16 h-16 text-slate-300" />
      <span className="mt-2 text-sm text-slate-500">Aperçu non disponible</span>
    </div>
  );
}
