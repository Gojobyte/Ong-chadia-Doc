import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Loader2,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { formatFileSize, formatRelativeDate } from '@/lib/utils';
import { Highlight } from '@/components/search/Highlight';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Button } from '@/components/ui/button';
import { DocumentDrawer } from '@/components/documents/DocumentDrawer';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface SearchResult {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string;
  folderName: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  tags: Array<{ id: string; name: string; color: string }>;
}

interface SearchResponse {
  data: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'name', label: 'Nom' },
  { value: 'size', label: 'Taille' },
];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Get current filters from URL
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const sizeMin = searchParams.get('sizeMin') || '';
  const sizeMax = searchParams.get('sizeMax') || '';
  const folderId = searchParams.get('folderId') || '';
  const tags = searchParams.get('tags') || '';
  const uploadedBy = searchParams.get('uploadedBy') || '';

  const { data: results, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ['search', 'results', query, type, sort, order, page, from, to, sizeMin, sizeMax, folderId, tags, uploadedBy],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        q: query,
        sort,
        order,
        page,
        limit: 20,
        recursive: 'true',
      };
      if (type) params.type = type;
      if (from) params.from = from;
      if (to) params.to = to;
      if (sizeMin) params.sizeMin = sizeMin;
      if (sizeMax) params.sizeMax = sizeMax;
      if (folderId) params.folderId = folderId;
      if (tags) params.tags = tags;
      if (uploadedBy) params.uploadedBy = uploadedBy;

      const response = await api.get('/documents/search', { params });
      return response.data;
    },
    enabled: query.length >= 2,
  });

  // Update URL when filters change
  const updateFilters = useCallback((newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete('page'); // Reset page when filters change
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    updateFilters({ [key]: value });
  }, [updateFilters]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set('q', query);
    setSearchParams(params);
  }, [query, setSearchParams]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-violet-500" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  // Count active filters
  const activeFilterCount = [
    type,
    from,
    to,
    sizeMin || sizeMax,
    folderId,
    tags,
    uploadedBy,
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
        {/* Background glow effects */}
        <div className="fixed top-20 right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-20 left-20 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/25">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">
                    Résultats de recherche
                  </h1>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                {query && (
                  <p className="text-sm text-slate-400">
                    {results?.pagination.total || 0} résultat{(results?.pagination.total || 0) !== 1 ? 's' : ''} pour "{query}"
                  </p>
                )}
              </div>
            </div>
          </motion.header>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                defaultValue={query}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newQuery = (e.target as HTMLInputElement).value;
                    if (newQuery.trim()) {
                      updateFilters({ q: newQuery.trim() });
                    }
                  }
                }}
                placeholder="Rechercher des documents..."
                className="input-obsidian w-full pl-12"
              />
            </div>

            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className={`relative ${showFilters ? 'btn-neon' : 'btn-ghost-dark'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 glass border border-white/[0.06] rounded-xl px-3">
              <select
                value={sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="border-0 bg-transparent text-sm py-2.5 focus:ring-0 font-medium text-slate-300"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#12121a] text-slate-300">
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleFilterChange('order', order === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
                title={order === 'asc' ? 'Croissant' : 'Décroissant'}
              >
                {order === 'asc' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <SearchFilters
                type={type}
                from={from}
                to={to}
                sizeMin={sizeMin}
                sizeMax={sizeMax}
                folderId={folderId}
                tags={tags}
                uploadedBy={uploadedBy}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </motion.div>
          )}

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-red-400">!</span>
                </div>
                <p className="text-lg font-semibold text-red-400">Erreur lors de la recherche</p>
              </div>
            ) : results?.data && results.data.length > 0 ? (
              <>
                <div className="card-obsidian rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                  {results.data.map((doc, index) => (
                    <motion.button
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedDocId(doc.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] text-left transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getFileIcon(doc.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                          <Highlight text={doc.name} query={query} />
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span>{doc.folderName}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{formatRelativeDate(doc.createdAt)}</span>
                          {doc.uploadedBy && (
                            <>
                              <span>•</span>
                              <span>{doc.uploadedBy.firstName} {doc.uploadedBy.lastName}</span>
                            </>
                          )}
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {doc.tags.slice(0, 5).map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-0.5 text-xs rounded-full font-medium"
                                style={{
                                  backgroundColor: tag.color + '20',
                                  color: tag.color,
                                  border: `1px solid ${tag.color}40`,
                                }}
                              >
                                <Highlight text={tag.name} query={query} />
                              </span>
                            ))}
                            {doc.tags.length > 5 && (
                              <span className="px-2 py-0.5 text-xs text-slate-500">
                                +{doc.tags.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Pagination */}
                {results.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', String(page - 1));
                        setSearchParams(params);
                      }}
                      className="btn-ghost-dark"
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-slate-300 px-4 py-2 bg-slate-800/50 rounded-lg border border-white/[0.06]">
                      Page {page} sur {results.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= results.pagination.totalPages}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', String(page + 1));
                        setSearchParams(params);
                      }}
                      className="btn-ghost-dark"
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            ) : query.length >= 2 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
                  <Search className="w-10 h-10 text-cyan-400" />
                </div>
                <p className="text-lg font-semibold text-white">Aucun résultat</p>
                <p className="text-slate-400 mt-1">
                  Aucun document ne correspond à "{query}"
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-4 btn-ghost-dark"
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
                  <Search className="w-10 h-10 text-cyan-400/60" />
                </div>
                <p className="text-lg font-semibold text-white">
                  Entrez au moins 2 caractères
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Document Drawer */}
      <DocumentDrawer
        documentId={selectedDocId}
        open={!!selectedDocId}
        onClose={() => setSelectedDocId(null)}
      />
    </DashboardLayout>
  );
}
