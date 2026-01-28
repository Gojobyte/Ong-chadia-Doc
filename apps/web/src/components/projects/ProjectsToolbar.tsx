import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Role, ProjectStatus } from '@ong-chadia/shared';

type SortField = 'name' | 'startDate' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface ProjectsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatuses: ProjectStatus[];
  onStatusChange: (statuses: ProjectStatus[]) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: ProjectStatus.DRAFT, label: 'Brouillon' },
  { value: ProjectStatus.PREPARATION, label: 'Préparation' },
  { value: ProjectStatus.IN_PROGRESS, label: 'En cours' },
  { value: ProjectStatus.COMPLETED, label: 'Terminé' },
  { value: ProjectStatus.CANCELLED, label: 'Annulé' },
];

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'name', label: 'Nom' },
  { value: 'startDate', label: 'Date de début' },
  { value: 'status', label: 'Statut' },
];

export function ProjectsToolbar({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  sortField,
  sortOrder,
  onSortChange,
}: ProjectsToolbarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;

  const toggleStatus = (status: ProjectStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const clearStatuses = () => {
    onStatusChange([]);
    setStatusDropdownOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="relative">
        <button
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="text-slate-600">
            Statut
            {selectedStatuses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                {selectedStatuses.length}
              </span>
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {statusDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setStatusDropdownOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
              <div className="p-2 space-y-1">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(option.value)}
                      onChange={() => toggleStatus(option.value)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {selectedStatuses.length > 0 && (
                <div className="border-t border-slate-100 p-2">
                  <button
                    onClick={clearStatuses}
                    className="w-full px-2 py-1.5 text-sm text-slate-500 hover:text-slate-700 text-left"
                  >
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">Trier</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {sortDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setSortDropdownOpen(false)}
            />
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
              <div className="p-2 space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (sortField === option.value) {
                        onSortChange(option.value, sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        onSortChange(option.value, 'desc');
                      }
                      setSortDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-2 py-1.5 rounded text-sm text-left
                      ${sortField === option.value ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    {option.label}
                    {sortField === option.value && (
                      <span className="text-xs text-primary-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* New Project Button - Staff+ only */}
      {isStaffOrAbove && (
        <Button
          onClick={() => navigate('/projects/new')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau projet</span>
        </Button>
      )}
    </div>
  );
}
