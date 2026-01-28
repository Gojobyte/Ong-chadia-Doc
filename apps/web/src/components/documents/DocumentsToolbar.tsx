import { Search, LayoutGrid, List, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';

type SortField = 'name' | 'createdAt' | 'size';
type SortOrder = 'asc' | 'desc';

interface DocumentsToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  selectedCount: number;
  onClearSelection: () => void;
}

export function DocumentsToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  sortField,
  sortOrder,
  onSortChange,
  selectedCount,
  onClearSelection,
}: DocumentsToolbarProps) {
  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'createdAt', label: 'Date' },
    { value: 'name', label: 'Nom' },
    { value: 'size', label: 'Taille' },
  ];

  return (
    <div className="flex flex-col gap-4 py-6">
      {/* Selection info bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/60 rounded-2xl px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/25">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-indigo-700">
              document{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              block w-full pl-11 pr-10 py-3 border border-slate-200/80 rounded-xl leading-5 bg-white/80 backdrop-blur-sm
              placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
              transition-all duration-300 text-sm shadow-sm hover:shadow-md hover:border-slate-300
            "
            placeholder="Rechercher par nom..."
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="
                appearance-none w-full inline-flex items-center justify-center px-4 py-3 pr-10
                border border-slate-200/80 text-sm font-medium rounded-xl
                text-slate-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-slate-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md
              "
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Trier par {option.label} {sortField === option.value ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* View Toggle */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-inner">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`
                p-2.5 rounded-lg transition-all duration-300
                ${viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }
              `}
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`
                p-2.5 rounded-lg transition-all duration-300
                ${viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }
              `}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
