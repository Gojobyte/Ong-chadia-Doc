import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Clock, X, Loader2, FolderKanban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Highlight } from './Highlight';

interface DocumentResult {
  id: string;
  name: string;
  mimeType: string;
  folderName: string;
  createdAt: string;
}

interface ProjectResult {
  id: string;
  name: string;
  status: string;
  description?: string;
}

interface SearchResponse {
  documents: {
    data: DocumentResult[];
    total: number;
  };
  projects: {
    data: ProjectResult[];
    total: number;
  };
}

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 10;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (!query.trim()) return;
  const recent = getRecentSearches();
  const filtered = recent.filter((s) => s.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PREPARATION: 'Préparation',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);

  // Unified search: documents + projects
  const { data: results, isLoading } = useQuery<SearchResponse>({
    queryKey: ['search', 'unified', debouncedQuery],
    queryFn: async () => {
      const [docsResponse, projectsResponse] = await Promise.all([
        api.get('/documents/search', {
          params: { q: debouncedQuery, limit: 5 },
        }),
        api.get('/projects', {
          params: { search: debouncedQuery, limit: 5 },
        }),
      ]);

      return {
        documents: {
          data: docsResponse.data.data || [],
          total: docsResponse.data.pagination?.total || 0,
        },
        projects: {
          data: projectsResponse.data.data || [],
          total: projectsResponse.data.pagination?.total || 0,
        },
      };
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  // Calculate total results for keyboard navigation
  const allResults = [
    ...(results?.documents.data.map((d) => ({ type: 'document' as const, item: d })) || []),
    ...(results?.projects.data.map((p) => ({ type: 'project' as const, item: p })) || []),
  ];

  // Load recent searches
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setSelectedIndex(-1);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSelectedIndex(-1);
    }
  }, [open]);

  // Keyboard navigation in results
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (!allResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      if (selected.type === 'document') {
        handleSelectDocument((selected.item as DocumentResult).id);
      } else {
        handleSelectProject((selected.item as ProjectResult).id);
      }
    }
  }, [allResults, selectedIndex]);

  const handleSelectDocument = useCallback((id: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    setOpen(false);
    navigate(`/documents/${id}`);
  }, [query, navigate]);

  const handleSelectProject = useCallback((id: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    setOpen(false);
    navigate(`/projects/${id}`);
  }, [query, navigate]);

  const handleViewAllResults = useCallback(() => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, navigate]);

  const handleSelectRecent = useCallback((search: string) => {
    setQuery(search);
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'text-red-500';
    if (mimeType.includes('word')) return 'text-blue-500';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'text-green-500';
    if (mimeType.startsWith('image/')) return 'text-purple-500';
    return 'text-slate-400';
  };

  const hasResults = (results?.documents.data.length || 0) + (results?.projects.data.length || 0) > 0;
  const totalResults = (results?.documents.total || 0) + (results?.projects.total || 0);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="hidden sm:inline text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={(e) => {
                  handleKeyNavigation(e);
                  if (e.key === 'Enter' && query.trim() && selectedIndex < 0) {
                    handleViewAllResults();
                  }
                }}
                placeholder="Rechercher documents, projets..."
                className="flex-1 text-base outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {/* Loading */}
              {isLoading && debouncedQuery.length >= 2 && (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recherche...</span>
                </div>
              )}

              {/* Documents Results */}
              {!isLoading && results?.documents.data && results.documents.data.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase">
                    Documents ({results.documents.total})
                  </p>
                  {results.documents.data.map((doc, index) => (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                        selectedIndex === index ? 'bg-blue-50' : 'hover:bg-slate-100'
                      )}
                    >
                      <FileText className={cn('w-5 h-5', getFileIcon(doc.mimeType))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          <Highlight text={doc.name} query={query} />
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {doc.folderName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Projects Results */}
              {!isLoading && results?.projects.data && results.projects.data.length > 0 && (
                <div className="p-2 border-t border-slate-100">
                  <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase">
                    Projets ({results.projects.total})
                  </p>
                  {results.projects.data.map((project, index) => {
                    const globalIndex = (results?.documents.data.length || 0) + index;
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleSelectProject(project.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                          selectedIndex === globalIndex ? 'bg-blue-50' : 'hover:bg-slate-100'
                        )}
                      >
                        <FolderKanban className="w-5 h-5 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            <Highlight text={project.name} query={query} />
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {STATUS_LABELS[project.status] || project.status}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* View All Results */}
              {!isLoading && hasResults && totalResults > 10 && (
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={handleViewAllResults}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg text-center font-medium"
                  >
                    Voir tous les résultats ({totalResults}) →
                  </button>
                </div>
              )}

              {/* No Results */}
              {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
                <div className="py-8 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Aucun résultat pour "{debouncedQuery}"</p>
                </div>
              )}

              {/* Recent Searches (when empty) */}
              {!query && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-xs font-medium text-slate-500 uppercase">
                      Recherches récentes
                    </p>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Effacer
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectRecent(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!query && recentSearches.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Rechercher documents et projets</p>
                  <p className="text-xs mt-1">Minimum 2 caractères</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono">↑↓</kbd>
                  {' '}pour naviguer
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono">↵</kbd>
                  {' '}pour sélectionner
                </span>
              </div>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono">esc</kbd>
                {' '}pour fermer
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
