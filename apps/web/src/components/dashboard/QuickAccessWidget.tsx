import { useNavigate } from 'react-router-dom';
import { Star, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useQuickAccess, useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

export function QuickAccessWidget() {
  const navigate = useNavigate();
  const { data: quickAccess, isLoading: quickLoading } = useQuickAccess(5, 30);
  const { data: favorites, isLoading: favLoading } = useFavorites();

  const isLoading = quickLoading || favLoading;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'text-red-500';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-500';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-500';
    if (mimeType.startsWith('image/')) return 'text-purple-500';
    return 'text-slate-400';
  };

  // Combine quick access with favorites, prioritize favorites
  const favoriteDocs = favorites?.favorites
    .filter((f) => f.type === 'document')
    .slice(0, 3)
    .map((f) => f.document!) || [];

  const quickDocs = quickAccess?.filter(
    (doc) => !favoriteDocs.some((fd) => fd.id === doc.id)
  ).slice(0, 5 - favoriteDocs.length) || [];

  const allDocs = [...favoriteDocs, ...quickDocs];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Accès rapide</h3>
        </div>
        <button
          onClick={() => navigate('/favorites')}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : allDocs.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">Aucun document récent</p>
          <p className="text-xs mt-1">
            Consultez des documents pour les voir ici
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {allDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => navigate(`/documents?doc=${doc.id}`)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                <FileText className={cn('w-4 h-4', getFileIcon(doc.mimeType))} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {doc.name}
                </p>
              </div>
              {favoriteDocs.some((fd) => fd.id === doc.id) && (
                <Star className="w-4 h-4 text-amber-500 fill-current" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
