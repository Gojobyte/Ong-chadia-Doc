import { useState } from 'react';
import { FileUp, FileText, FileImage, FileSpreadsheet, File, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatRelativeDate } from '@/lib/utils';
import { DocumentDrawer } from '@/components/documents/DocumentDrawer';
import type { DocumentResponse } from '@ong-chadia/shared';

interface RecentDocumentsResponse {
  data: DocumentResponse[];
  total: number;
}

export function RecentUploadsWidget() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: async () => {
      const response = await api.get<RecentDocumentsResponse>('/documents/search', {
        params: { limit: 5, sort: 'createdAt', order: 'desc' },
      });
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    }
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-4 h-4 text-purple-500" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileUp className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Documents récents</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-100" />
              <div className="flex-1">
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileUp className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-slate-900">Documents récents</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-32 text-red-500">
          <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
          <p className="text-sm">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  const documents = data?.data || [];

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileUp className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-slate-900">Documents récents</h3>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className="w-full flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                  {getFileIcon(doc.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeDate(doc.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            Aucun document uploadé
          </div>
        )}
      </div>

      <DocumentDrawer
        documentId={selectedDocId}
        open={!!selectedDocId}
        onClose={() => setSelectedDocId(null)}
      />
    </>
  );
}
