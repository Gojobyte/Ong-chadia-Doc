import { useNavigate } from 'react-router-dom';
import { FileText, Link2, ExternalLink, File, FileImage, FileSpreadsheet, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProjectDocument } from '@ong-chadia/shared';

interface ProjectDocumentsProps {
  documents: ProjectDocument[];
  isLoading?: boolean;
  canLink?: boolean;
  onLinkDocuments?: () => void;
}

function getFileIcon(mimeType?: string) {
  if (!mimeType) return File;

  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('pdf')) return FileType;
  if (mimeType.includes('text/') || mimeType.includes('document')) return FileText;

  return File;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function ProjectDocuments({ documents, isLoading, canLink, onLinkDocuments }: ProjectDocumentsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-8 h-8 rounded bg-slate-200" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">
            Documents ({documents.length})
          </h3>
        </div>
        {canLink && (
          <Button variant="ghost" size="sm" onClick={onLinkDocuments} className="gap-1">
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Lier</span>
          </Button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-400 italic mb-3">
            Aucun document lié
          </p>
          {canLink && (
            <Button variant="outline" size="sm" onClick={onLinkDocuments} className="gap-2">
              <Link2 className="w-4 h-4" />
              Lier des documents
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {documents.slice(0, 5).map((doc) => {
            const Icon = getFileIcon(doc.document?.mimeType);

            return (
              <button
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.documentId}`)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                    {doc.document?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(doc.document?.size)}
                  </p>
                </div>

                {/* External Link Icon */}
                <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}

          {documents.length > 5 && (
            <button
              onClick={() => navigate(`/documents?projectId=${documents[0]?.projectId}`)}
              className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              Voir les {documents.length - 5} autres documents →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
