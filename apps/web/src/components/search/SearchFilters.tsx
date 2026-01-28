import { useState, useEffect } from 'react';
import {
  Calendar,
  FolderTree,
  Tag,
  User,
  HardDrive,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTags } from '@/hooks/useTags';
import { useUsers } from '@/hooks/useUsers';
import { useRootFolders, useFolderChildren } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  type: string;
  from: string;
  to: string;
  sizeMin: string;
  sizeMax: string;
  folderId: string;
  tags: string;
  uploadedBy: string;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

const FILE_TYPE_FILTERS = [
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'word', label: 'Word', icon: '📝' },
  { value: 'excel', label: 'Excel', icon: '📊' },
  { value: 'image', label: 'Images', icon: '🖼️' },
];

const SIZE_PRESETS = [
  { label: 'Tous', min: '', max: '' },
  { label: '< 1 Mo', min: '', max: '1048576' },
  { label: '1-10 Mo', min: '1048576', max: '10485760' },
  { label: '10-50 Mo', min: '10485760', max: '52428800' },
  { label: '> 50 Mo', min: '52428800', max: '' },
];

interface FolderItemProps {
  id: string;
  name: string;
  hasChildren: boolean;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}

function FolderItem({ id, name, hasChildren, depth, selectedId, onSelect }: FolderItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: children, isLoading } = useFolderChildren(expanded ? id : null);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors',
          selectedId === id
            ? 'bg-primary-100 text-primary-700'
            : 'hover:bg-slate-100'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-slate-200 rounded"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span
          onClick={() => onSelect(selectedId === id ? '' : id)}
          className="flex-1 text-sm truncate"
        >
          {name}
        </span>
      </div>
      {expanded && !isLoading && children && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderItem
              key={child.id}
              id={child.id}
              name={child.name}
              hasChildren={child._count?.children > 0 || false}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchFilters({
  type,
  from,
  to,
  sizeMin,
  sizeMax,
  folderId,
  tags: tagsParam,
  uploadedBy,
  onFilterChange,
  onClearFilters,
}: SearchFiltersProps) {
  const { data: allTags } = useTags();
  const { data: users } = useUsers({ limit: 50 });
  const { data: rootFolders } = useRootFolders();

  const selectedTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
  const activeTypes = type ? type.split(',').filter(Boolean) : [];

  // Count active filters
  const activeFilterCount = [
    type,
    from,
    to,
    sizeMin || sizeMax,
    folderId,
    tagsParam,
    uploadedBy,
  ].filter(Boolean).length;

  const toggleType = (typeValue: string) => {
    const newTypes = activeTypes.includes(typeValue)
      ? activeTypes.filter((t) => t !== typeValue)
      : [...activeTypes, typeValue];
    onFilterChange('type', newTypes.join(','));
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    onFilterChange('tags', newTags.join(','));
  };

  const handleSizePreset = (min: string, max: string) => {
    onFilterChange('sizeMin', min);
    onFilterChange('sizeMax', max);
  };

  const getSizePresetLabel = () => {
    const preset = SIZE_PRESETS.find(
      (p) => p.min === sizeMin && p.max === sizeMax
    );
    return preset?.label || 'Personnalisé';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          Filtres avancés
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
              {activeFilterCount} actif{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Type de fichier */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <span className="p-1 bg-slate-100 rounded">📁</span>
            Type de fichier
          </label>
          <div className="flex flex-wrap gap-2">
            {FILE_TYPE_FILTERS.map((filter) => {
              const isActive = activeTypes.includes(filter.value);
              return (
                <button
                  key={filter.value}
                  onClick={() => toggleType(filter.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5',
                    isActive
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Période */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Période
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => onFilterChange('from', e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <span className="text-slate-400">à</span>
            <input
              type="date"
              value={to}
              onChange={(e) => onFilterChange('to', e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Taille */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <HardDrive className="w-4 h-4 text-slate-500" />
            Taille
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZE_PRESETS.map((preset) => {
              const isActive = preset.min === sizeMin && preset.max === sizeMax;
              return (
                <button
                  key={preset.label}
                  onClick={() => handleSizePreset(preset.min, preset.max)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    isActive
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dossier */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <FolderTree className="w-4 h-4 text-slate-500" />
            Dossier
          </label>
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
            {folderId && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-primary-50 border-b border-slate-200">
                <span className="text-sm text-primary-700">Filtre actif</span>
                <button
                  onClick={() => onFilterChange('folderId', '')}
                  className="p-0.5 hover:bg-primary-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-primary-600" />
                </button>
              </div>
            )}
            <div className="p-1">
              {rootFolders?.map((folder) => (
                <FolderItem
                  key={folder.id}
                  id={folder.id}
                  name={folder.name}
                  hasChildren={folder._count?.children > 0 || false}
                  depth={0}
                  selectedId={folderId}
                  onSelect={(id) => onFilterChange('folderId', id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Tag className="w-4 h-4 text-slate-500" />
            Tags
          </label>
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2">
            {allTags && allTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full transition-colors',
                        isSelected
                          ? 'ring-2 ring-offset-1'
                          : 'opacity-70 hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                        ringColor: isSelected ? tag.color : undefined,
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">
                Aucun tag disponible
              </p>
            )}
          </div>
        </div>

        {/* Uploadé par */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 text-slate-500" />
            Uploadé par
          </label>
          <select
            value={uploadedBy}
            onChange={(e) => onFilterChange('uploadedBy', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Tous les utilisateurs</option>
            {users?.data?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
