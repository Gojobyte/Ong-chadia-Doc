import { FolderOpen, AlertCircle } from 'lucide-react';
import { useFolderAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';

export function TopFoldersWidget() {
  const { data, isLoading, error } = useFolderAnalytics(5);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Top dossiers</h3>
        </div>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-2 bg-slate-100 rounded w-full" />
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
          <FolderOpen className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-slate-900">Top dossiers</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-32 text-red-500">
          <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
          <p className="text-sm">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  const folders = data?.data || [];
  const maxCount = Math.max(...folders.map((f) => f.documentCount), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-slate-900">Top dossiers</h3>
      </div>

      {folders.length > 0 ? (
        <div className="space-y-4">
          {folders.map((folder) => {
            const percentage = (folder.documentCount / maxCount) * 100;

            return (
              <button
                key={folder.id}
                onClick={() => navigate(`/documents?folderId=${folder.id}`)}
                className="w-full text-left hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate flex-1">
                    {folder.name}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {folder.documentCount} docs
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{folder.path}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
          Aucun dossier avec des documents
        </div>
      )}
    </div>
  );
}
