import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2, MoreHorizontal } from 'lucide-react';
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
  const { data: children, isLoading } = useFolderChildren(
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
          'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors group',
          'hover:bg-slate-100',
          isSelected && 'bg-primary-50 text-primary-700 hover:bg-primary-100'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
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
          <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
        )}

        {/* Folder name */}
        <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>

        {/* Context menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <FolderContextMenu
            folder={folder}
            onCreateSubfolder={() => onCreateSubfolder(folder.id)}
            onRename={() => onRename(folder)}
            onMove={() => onMove(folder)}
            onDelete={() => onDelete(folder)}
          />
        </div>
      </div>

      {/* Children (rendered when expanded) */}
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
