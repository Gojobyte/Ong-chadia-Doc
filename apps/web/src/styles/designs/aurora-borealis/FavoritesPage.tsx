import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FileText, Folder, Loader2, Clock, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <main className="flex-1 overflow-y-auto bg-aurora relative">
        {/* Aurora orbs */}
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Favoris & Récents</h1>
                  <Sparkles className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-sm text-gray-500">
                  Accédez rapidement à vos documents et dossiers favoris
                </p>
              </div>
            </div>
          </motion.header>

          {/* View Type Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-6"
          >
            <button
              onClick={() => setViewType('favorites')}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2',
                viewType === 'favorites'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'glass-colored text-gray-600 hover:bg-white/80 border border-gray-200/50'
              )}
            >
              <Star className="w-4 h-4" />
              Favoris
              {favoritesData && (
                <span className={cn(
                  'ml-1 px-2 py-0.5 text-xs rounded-full',
                  viewType === 'favorites' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-600'
                )}>
                  {favoritesData.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewType('recent')}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2',
                viewType === 'recent'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                  : 'glass-colored text-gray-600 hover:bg-white/80 border border-gray-200/50'
              )}
            >
              <Clock className="w-4 h-4" />
              Récents
            </button>
          </motion.div>

          {/* Favorites View */}
          {viewType === 'favorites' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 p-1.5 glass-colored rounded-xl w-fit border border-gray-200/50">
                {(['all', 'documents', 'folders'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      filter === type
                        ? 'bg-white text-gray-900 shadow-sm'
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
                  <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse" />
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Impossible de charger vos favoris
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="glass-colored border-gray-200 text-gray-600 hover:bg-white/80 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </Button>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
                    <Star className="w-10 h-10 text-amber-500" />
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
                  {filteredFavorites.map((fav, index) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() =>
                        fav.type === 'document'
                          ? handleDocumentClick(fav.document!.id)
                          : handleFolderClick(fav.folder!.id)
                      }
                      className="card-aurora-hover flex items-center gap-4 p-4 cursor-pointer group"
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
                          fav.type === 'document'
                            ? 'bg-pink-500/10'
                            : 'bg-amber-500/10'
                        )}
                      >
                        {fav.type === 'document' ? (
                          <FileText
                            className={cn(
                              'w-6 h-6',
                              getFileIcon(fav.document!.mimeType)
                            )}
                          />
                        ) : (
                          <Folder className="w-6 h-6 text-amber-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-pink-500 transition-colors">
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
                      <span className="text-xs text-gray-500 px-3 py-1.5 rounded-lg glass-colored border border-gray-200/50">
                        Ajouté {formatDate(fav.createdAt)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Documents View */}
          {viewType === 'recent' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {recentLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse" />
                  </div>
                </div>
              ) : recentError ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Impossible de charger les documents récents
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => refetchRecent()}
                    className="glass-colored border-gray-200 text-gray-600 hover:bg-white/80 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </Button>
                </div>
              ) : !recentDocs || recentDocs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/10">
                    <Clock className="w-10 h-10 text-teal-500" />
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
                  {recentDocs.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="card-aurora-hover flex items-center gap-4 p-4 cursor-pointer group"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <FileText
                          className={cn('w-6 h-6', getFileIcon(doc.mimeType))}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-pink-500 transition-colors">
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
                      <span className="text-xs text-gray-500 px-3 py-1.5 rounded-lg glass-colored border border-gray-200/50">
                        Consulté {formatDate(doc.lastAccessedAt)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
