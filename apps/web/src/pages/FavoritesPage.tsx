import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FileText, Folder, Loader2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useFavorites, useRecentDocuments } from '@/hooks/useFavorites';
import { FavoriteButton } from '@/components/documents/FavoriteButton';
import { formatFileSize, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type FilterType = 'all' | 'documents' | 'folders';
type ViewType = 'favorites' | 'recent';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('favorites');

  const { data: favoritesData, isLoading: favoritesLoading, error: favoritesError, refetch: refetchFavorites } = useFavorites();
  const { data: recentDocs, isLoading: recentLoading, error: recentError, refetch: refetchRecent } = useRecentDocuments(20);

  const favorites = favoritesData?.favorites || [];
  const filteredFavorites = favorites.filter((fav) => {
    if (filter === 'all') return true;
    if (filter === 'documents') return fav.type === 'document';
    if (filter === 'folders') return fav.type === 'folder';
    return true;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'text-red-400';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-400';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-emerald-400';
    if (mimeType.startsWith('image/')) return 'text-violet-400';
    return 'text-slate-400';
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents?doc=${documentId}`);
  };

  const handleFolderClick = (folderId: string) => {
    navigate(`/documents?folder=${folderId}`);
  };

  const isLoading = viewType === 'favorites' ? favoritesLoading : recentLoading;
  const error = viewType === 'favorites' ? favoritesError : recentError;
  const refetch = viewType === 'favorites' ? refetchFavorites : refetchRecent;

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Favoris & Récents</h1>
                <p className="text-sm text-gray-500">
                  Accédez rapidement à vos documents et dossiers favoris
                </p>
              </div>
            </div>
          </header>

          {/* View Type Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setViewType('favorites')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                viewType === 'favorites'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              <Star className="w-4 h-4" />
              Favoris
              {favoritesData && (
                <span className={cn(
                  'ml-1 px-2 py-0.5 text-xs rounded-full',
                  viewType === 'favorites' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                )}>
                  {favoritesData.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewType('recent')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                viewType === 'recent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              <Clock className="w-4 h-4" />
              Récents
            </button>
          </div>

          {/* Favorites View */}
          {viewType === 'favorites' && (
            <div>
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 p-1.5 bg-white rounded-lg w-fit border border-gray-200">
                {(['all', 'documents', 'folders'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      filter === type
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {type === 'all' && 'Tous'}
                    {type === 'documents' && 'Documents'}
                    {type === 'folders' && 'Dossiers'}
                  </button>
                ))}
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Impossible de charger vos favoris
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="btn-simple-outline flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </Button>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun favori
                  </h3>
                  <p className="text-gray-500">
                    Cliquez sur l'étoile d'un document pour l'ajouter à vos favoris
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      onClick={() =>
                        fav.type === 'document'
                          ? handleDocumentClick(fav.document!.id)
                          : handleFolderClick(fav.folder!.id)
                      }
                      className="card-simple card-simple-hover flex items-center gap-4 p-4 cursor-pointer group"
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          fav.type === 'document'
                            ? 'bg-blue-50'
                            : 'bg-amber-50'
                        )}
                      >
                        {fav.type === 'document' ? (
                          <FileText
                            className={cn(
                              'w-5 h-5',
                              getFileIcon(fav.document!.mimeType)
                            )}
                          />
                        ) : (
                          <Folder className="w-5 h-5 text-amber-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {fav.type === 'document'
                            ? fav.document!.name
                            : fav.folder!.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {fav.type === 'document' ? (
                            <>
                              {formatFileSize(fav.document!.size)} •{' '}
                              {formatDate(fav.document!.createdAt)}
                            </>
                          ) : (
                            'Dossier'
                          )}
                        </p>
                      </div>

                      {/* Favorite Button */}
                      {fav.type === 'document' && (
                        <FavoriteButton documentId={fav.document!.id} />
                      )}

                      {/* Added date */}
                      <span className="text-xs text-gray-500 px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200">
                        Ajouté {formatDate(fav.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Documents View */}
          {viewType === 'recent' && (
            <div>
              {recentLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : recentError ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Impossible de charger les documents récents
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => refetchRecent()}
                    className="btn-simple-outline flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </Button>
                </div>
              ) : !recentDocs || recentDocs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun document récent
                  </h3>
                  <p className="text-gray-500">
                    Les documents que vous consultez apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="card-simple card-simple-hover flex items-center gap-4 p-4 cursor-pointer group"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText
                          className={cn('w-5 h-5', getFileIcon(doc.mimeType))}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)}
                          {doc.folder && ` • ${doc.folder.name}`}
                        </p>
                      </div>

                      {/* Favorite Button */}
                      <FavoriteButton documentId={doc.id} />

                      {/* Last accessed */}
                      <span className="text-xs text-gray-500 px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200">
                        Consulté {formatDate(doc.lastAccessedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
