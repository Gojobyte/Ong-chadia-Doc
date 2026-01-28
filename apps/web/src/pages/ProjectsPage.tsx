import { useState, useMemo } from 'react';
import { FolderKanban, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ProjectsGrid,
  ProjectsToolbar,
  ProjectsEmptyState,
  ProjectsPagination,
  ProjectsSkeleton,
} from '@/components/projects';
import { useProjects } from '@/hooks/useProjects';
import { useDebounce } from '@/hooks/useDebounce';
import { ProjectStatus, type ProjectQueryParams } from '@ong-chadia/shared';

type SortField = 'name' | 'startDate' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function ProjectsPage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build query params
  const queryParams = useMemo<ProjectQueryParams>(() => {
    const params: ProjectQueryParams = {
      page,
      limit,
      sort: sortField,
      order: sortOrder,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (selectedStatuses.length > 0) {
      params.status = selectedStatuses.join(',') as any;
    }

    return params;
  }, [page, limit, sortField, sortOrder, debouncedSearch, selectedStatuses]);

  // Fetch projects
  const { data, isLoading, error } = useProjects(queryParams);

  const projects = data?.data || [];
  const pagination = data?.pagination;

  // Reset page when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusChange = (statuses: ProjectStatus[]) => {
    setSelectedStatuses(statuses);
    setPage(1);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">Projets</h1>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-sm text-slate-500">
                  Gérez et suivez les projets de l'organisation
                </p>
              </div>
            </div>
          </motion.header>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProjectsToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedStatuses={selectedStatuses}
              onStatusChange={handleStatusChange}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isLoading ? (
              <ProjectsSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                  <span className="text-2xl text-red-500">!</span>
                </div>
                <p className="text-lg font-semibold text-red-600">Erreur de chargement</p>
                <p className="text-sm text-slate-500 mt-1">{error.message}</p>
              </div>
            ) : projects.length === 0 ? (
              <ProjectsEmptyState
                type={debouncedSearch || selectedStatuses.length > 0 ? 'no-results' : 'no-projects'}
                searchQuery={debouncedSearch}
              />
            ) : (
              <>
                <ProjectsGrid projects={projects} />

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <ProjectsPagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
    </DashboardLayout>
  );
}
