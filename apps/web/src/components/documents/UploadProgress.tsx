import { FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

interface UploadProgressProps {
  uploads: UploadItem[];
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}

export function UploadProgress({
  uploads,
  onCancel,
  onRemove,
  onRetry,
}: UploadProgressProps) {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Téléversements ({uploads.length})
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {uploads.map((upload) => (
          <div key={upload.id} className="px-4 py-3 border-b border-slate-100 last:border-0">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {upload.file.name}
                  </span>
                  {upload.status === 'uploading' && onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onCancel(upload.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  {upload.status === 'complete' && onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600"
                      onClick={() => onRemove(upload.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {upload.status === 'error' && onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => onRemove(upload.id)}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatFileSize(upload.file.size)}
                </div>

                {upload.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-10 text-right">
                        {upload.progress}%
                      </span>
                    </div>
                  </div>
                )}

                {upload.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    En attente...
                  </div>
                )}

                {upload.status === 'error' && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600">{upload.error || 'Erreur de téléversement'}</p>
                    {onRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs mt-1"
                        onClick={() => onRetry(upload.id)}
                      >
                        Réessayer
                      </Button>
                    )}
                  </div>
                )}

                {upload.status === 'complete' && (
                  <div className="text-xs text-green-600 mt-1">
                    Téléversement terminé
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
