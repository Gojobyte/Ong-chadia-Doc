import {
  FileText,
  File,
  Image,
  Table2,
  MoreHorizontal,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { formatFileSize, formatRelativeDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDocumentSelection } from '@/stores/document-selection.store';
import { useDocumentTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';
import type { DocumentResponse } from '@ong-chadia/shared';

// File type icon mapping
const FILE_TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'application/pdf': FileText,
  'application/msword': File,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': File,
  'application/vnd.ms-excel': Table2,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': Table2,
  'image/jpeg': Image,
  'image/png': Image,
  'image/gif': Image,
  'text/plain': FileText,
};

// File type colors
const FILE_TYPE_COLORS: Record<string, string> = {
  'application/pdf': 'text-red-500',
  'application/msword': 'text-blue-500',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'text-blue-500',
  'application/vnd.ms-excel': 'text-green-500',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'text-green-500',
  'image/jpeg': 'text-purple-500',
  'image/png': 'text-purple-500',
  'image/gif': 'text-purple-500',
  'text/plain': 'text-slate-500',
};

interface DocumentRowProps {
  document: DocumentResponse;
  onClick?: (doc: DocumentResponse) => void;
  onRename?: (doc: DocumentResponse) => void;
  onDelete?: (doc: DocumentResponse) => void;
  onDownload?: (doc: DocumentResponse) => void;
  selectable?: boolean;
  allDocumentIds?: string[];
}

export function DocumentRow({
  document,
  onClick,
  onRename,
  onDelete,
  onDownload,
  selectable = false,
  allDocumentIds = [],
}: DocumentRowProps) {
  const { isSelected, toggle, selectRange, lastSelectedId } = useDocumentSelection();
  const { data: documentTags = [] } = useDocumentTags(document.id);
  const selected = isSelected(document.id);

  const IconComponent = FILE_TYPE_ICONS[document.mimeType] || File;
  const iconColor = FILE_TYPE_COLORS[document.mimeType] || 'text-slate-400';

  // Extract file extension
  const extension = document.name.split('.').pop()?.toUpperCase() || '';

  const handleRowClick = (e: React.MouseEvent) => {
    if (selectable && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggle(document.id);
    } else if (selectable && e.shiftKey && lastSelectedId) {
      e.preventDefault();
      selectRange(lastSelectedId, document.id, allDocumentIds);
    } else {
      onClick?.(document);
    }
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey && lastSelectedId) {
      selectRange(lastSelectedId, document.id, allDocumentIds);
    } else {
      toggle(document.id);
    }
  };

  return (
    <tr
      className={cn(
        'hover:bg-slate-50/80 transition-colors group cursor-pointer',
        selected && 'bg-primary-50/50'
      )}
      onClick={handleRowClick}
    >
      {selectable && (
        <td className="px-4 py-3 w-12" onClick={handleCheckboxChange}>
          <Checkbox
            checked={selected}
            className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
          />
        </td>
      )}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 group-hover:text-primary-700">
          <div className={`w-8 h-8 rounded flex items-center justify-center bg-slate-100 ${iconColor}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-medium text-slate-900 truncate block">
              {document.name}
            </span>
            {/* Tags */}
            {documentTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {documentTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
                {documentTags.length > 3 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                    +{documentTags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {extension}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-600 text-sm">
        {formatFileSize(document.size)}
      </td>
      <td className="px-4 py-3 text-slate-600 text-sm">
        {formatRelativeDate(document.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDownload?.(document)}
            title="Télécharger"
          >
            <Download className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onDownload?.(document)}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRename?.(document)}>
                <Pencil className="w-4 h-4 mr-2" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(document)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
