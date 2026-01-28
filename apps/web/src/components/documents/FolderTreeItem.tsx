import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFolderChildren } from '@/hooks/useFolders';
import { FolderContextMenu } from './FolderContextMenu';
import type { FolderResponse } from '@ong-chadia/shared';

interface FolderTreeItemProps {
  folder: FolderResponse;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateSubfolder: (parentId: string) => void;
  onRename: (folder: FolderResponse) => void;
  onMove: (folder: FolderResponse) => void;
  onDelete: (folder: FolderResponse) => void;
}

export function FolderTreeItem({
  folder,
  level,
  selectedId,
  onSelect,
  onCreateSubfolder,
  onRename,
  onMove,
  onDelete,
}: FolderTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = folder._count?.children && folder._count.children > 0;

  // Only fetch children when expanded
  const { data: children, isLoading, error } = useFolderChildren(
    isExpanded ? folder.id : null
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onSelect(folder.id);
  };

  const isSelected = selectedId === folder.id;

  return (
    <div>
      {/* Folder item row */}
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 group mb-0.5',
          isSelected
            ? 'bg-primary-50 text-primary-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleSelect}
      >
        {/* Expand/collapse button */}
        <button
          onClick={handleToggle}
          className={cn(
            'p-0.5 rounded hover:bg-slate-200 transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Folder icon */}
        {isExpanded ? (
          <FolderOpen className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-primary-600' : 'text-slate-400')} />
        ) : (
          <Folder className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-primary-600' : 'text-slate-400')} />
        )}

        {/* Folder name */}
        <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>

        {/* Context menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <FolderContextMenu
            onCreateSubfolder={() => onCreateSubfolder(folder.id)}
            onRename={() => onRename(folder)}
            onMove={() => onMove(folder)}
            onDelete={() => onDelete(folder)}
          />
        </div>
      </div>

      {/* Children (rendered when expanded) */}
      {isExpanded && error && (
        <div
          className="flex items-center gap-2 px-3 py-2 text-xs text-red-500"
          style={{ paddingLeft: `${(level + 1) * 16 + 12}px` }}
        >
          <AlertCircle className="w-3 h-3" />
          Erreur de chargement
        </div>
      )}
      {isExpanded && children && (
        <div>
          {children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSubfolder={onCreateSubfolder}
              onRename={onRename}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
