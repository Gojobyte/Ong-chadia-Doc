import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Share2,
  CheckCircle2,
  File,
  Eye,
  Info,
  FileType,
  Presentation,
  Loader2,
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';
import { useDocumentSelection } from '@/stores/document-selection.store';
import { useDocumentTags } from '@/hooks/useTags';
import type { DocumentResponse } from '@ong-chadia/shared';

// File type configuration for badges and icons
const FILE_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; gradient: string; icon: typeof FileText }> = {
  'application/pdf': { label: 'PDF', color: 'text-red-600', bgColor: 'bg-red-50', gradient: 'from-red-500 to-rose-500', icon: FileText },
  'application/msword': { label: 'DOC', color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-500', icon: FileText },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-500', icon: FileText },
  'application/vnd.ms-excel': { label: 'XLS', color: 'text-emerald-600', bgColor: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-500', icon: FileSpreadsheet },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', color: 'text-emerald-600', bgColor: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-500', icon: FileSpreadsheet },
  'application/vnd.ms-powerpoint': { label: 'PPT', color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-amber-500', icon: Presentation },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PPTX', color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-amber-500', icon: Presentation },
  'image/jpeg': { label: 'JPG', color: 'text-violet-600', bgColor: 'bg-violet-50', gradient: 'from-violet-500 to-purple-500', icon: FileImage },
  'image/png': { label: 'PNG', color: 'text-violet-600', bgColor: 'bg-violet-50', gradient: 'from-violet-500 to-purple-500', icon: FileImage },
  'image/gif': { label: 'GIF', color: 'text-violet-600', bgColor: 'bg-violet-50', gradient: 'from-violet-500 to-purple-500', icon: FileImage },
  'image/webp': { label: 'WEBP', color: 'text-violet-600', bgColor: 'bg-violet-50', gradient: 'from-violet-500 to-purple-500', icon: FileImage },
  'text/plain': { label: 'TXT', color: 'text-slate-600', bgColor: 'bg-slate-100', gradient: 'from-slate-500 to-slate-600', icon: FileType },
};

// Check if document can have a thumbnail preview
function canHaveThumbnail(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  );
}

// Generate Google Docs Viewer thumbnail URL
function getGoogleDocsThumbUrl(url: string): string {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

interface DocumentCardProps {
  document: DocumentResponse;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick: (doc: DocumentResponse) => void;
  onDownload: (doc: DocumentResponse) => void;
  onRename: (doc: DocumentResponse) => void;
  onDelete: (doc: DocumentResponse) => void;
  onShare?: (doc: DocumentResponse) => void;
  onInfo?: (doc: DocumentResponse) => void;
  selectable?: boolean;
  allDocumentIds?: string[];
}

export function DocumentCard({
  document,
  selected: selectedProp,
  onSelect,
  onClick,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onInfo,
  selectable = false,
  allDocumentIds = [],
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { isSelected, toggle, selectRange, lastSelectedId } = useDocumentSelection();
  const { data: documentTags = [] } = useDocumentTags(document.id);

  // Use store selection if selectable mode is enabled, otherwise use prop
  const selected = selectable ? isSelected(document.id) : (selectedProp ?? false);

  // Get file type configuration
  const fileTypeConfig = useMemo(() => {
    const config = FILE_TYPE_CONFIG[document.mimeType];
    if (config) return config;

    // Fallback based on mime type prefix
    if (document.mimeType.startsWith('image/')) {
      return { label: 'IMG', color: 'text-violet-600', bgColor: 'bg-violet-50', gradient: 'from-violet-500 to-purple-500', icon: FileImage };
    }
    if (document.mimeType.includes('pdf')) {
      return { label: 'PDF', color: 'text-red-600', bgColor: 'bg-red-50', gradient: 'from-red-500 to-rose-500', icon: FileText };
    }
    return { label: 'FILE', color: 'text-slate-600', bgColor: 'bg-slate-100', gradient: 'from-slate-500 to-slate-600', icon: File };
  }, [document.mimeType]);

  const isImage = document.mimeType.startsWith('image/');
  const isPdfOrOffice = canHaveThumbnail(document.mimeType) && !isImage;
  const IconComponent = fileTypeConfig.icon;
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Reset thumbnail state when document changes
  useEffect(() => {
    setThumbnailLoading(true);
    setThumbnailError(false);
  }, [document.id]);

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectable) {
      if (e.shiftKey && lastSelectedId) {
        selectRange(lastSelectedId, document.id, allDocumentIds);
      } else {
        toggle(document.id);
      }
    } else {
      onSelect?.(document.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectable && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggle(document.id);
    } else if (selectable && e.shiftKey && lastSelectedId) {
      e.preventDefault();
      selectRange(lastSelectedId, document.id, allDocumentIds);
    } else {
      onClick(document);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowMenu(false);
  };

  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${selected
          ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'
        }
      `}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      <div
        className={`
          absolute top-3 left-3 z-10 transition-all duration-200
          ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}
        `}
        onClick={handleSelectClick}
      >
        <div
          className={`
            h-6 w-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm
            ${selected
              ? 'bg-gradient-to-br from-indigo-500 to-violet-500 border-transparent'
              : 'bg-white/90 backdrop-blur-sm border-slate-300 hover:border-indigo-400'
            }
          `}
        >
          {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
        </div>
      </div>

      {/* Favorite & Action Menu */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        {/* Favorite Button - always visible when favorited, otherwise on hover */}
        <div className="opacity-100 transition-opacity duration-200">
          <FavoriteButton documentId={document.id} size="sm" />
        </div>

        {/* Menu Button */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200/50"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200/80 py-1.5 z-20 overflow-hidden">
              <button
                onClick={(e) => handleAction(e, () => onClick(document))}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
              >
                <Eye className="w-4 h-4" /> Aperçu
              </button>
              {onInfo && (
                <button
                  onClick={(e) => handleAction(e, () => onInfo(document))}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                >
                  <Info className="w-4 h-4" /> Détails
                </button>
              )}
              <button
                onClick={(e) => handleAction(e, () => onDownload(document))}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
              >
                <Download className="w-4 h-4" /> Télécharger
              </button>
              <button
                onClick={(e) => handleAction(e, () => onRename(document))}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
              >
                <Pencil className="w-4 h-4" /> Renommer
              </button>
              {onShare && (
                <button
                  onClick={(e) => handleAction(e, () => onShare(document))}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Partager
                </button>
              )}
              <hr className="my-1.5 border-slate-100" />
              <button
                onClick={(e) => handleAction(e, () => onDelete(document))}
                className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center p-4 space-y-3">
        {/* File Type Badge */}
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${fileTypeConfig.bgColor} ${fileTypeConfig.color} uppercase tracking-wide`}>
          {fileTypeConfig.label}
        </span>

        {/* Thumbnail Preview - Full width */}
        <div className="relative w-full h-36 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100">
          {/* Image thumbnail */}
          {isImage && document.url ? (
            <>
              {thumbnailLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-lg animate-pulse" />
                  </div>
                </div>
              )}
              <img
                src={document.url}
                alt={document.name}
                className={`w-full h-full object-cover transition-all duration-300 ${thumbnailLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'} group-hover:scale-105`}
                loading="lazy"
                onLoad={() => setThumbnailLoading(false)}
                onError={() => {
                  setThumbnailLoading(false);
                  setThumbnailError(true);
                }}
              />
              {thumbnailError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fileTypeConfig.gradient} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                </div>
              )}
            </>
          ) : isPdfOrOffice && document.url && !thumbnailError ? (
            /* PDF/Office document thumbnail using Google Docs Viewer */
            <>
              {thumbnailLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-lg animate-pulse" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  src={getGoogleDocsThumbUrl(document.url)}
                  title={document.name}
                  className="border-0 pointer-events-none origin-top-left"
                  style={{
                    width: '250%',
                    height: '250%',
                    transform: 'scale(0.4)',
                    transformOrigin: 'top left'
                  }}
                  onLoad={() => setThumbnailLoading(false)}
                  onError={() => {
                    setThumbnailLoading(false);
                    setThumbnailError(true);
                  }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </>
          ) : (
            /* Fallback icon with gradient */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${fileTypeConfig.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="text-center w-full px-1">
          <h3
            className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors"
            title={document.name}
          >
            {document.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-medium">{formatFileSize(document.size)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{formatDate(document.createdAt)}</span>
          </div>

          {/* Tags */}
          {documentTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {documentTags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm"
                  style={{
                    backgroundColor: tag.color + '15',
                    color: tag.color,
                    border: `1px solid ${tag.color}30`,
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {documentTags.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  +{documentTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-sm border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex justify-around items-center">
        {onInfo && (
          <button
            onClick={(e) => handleAction(e, () => onInfo(document))}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Détails"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => handleAction(e, () => onDownload(document))}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
          title="Télécharger"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => handleAction(e, () => onRename(document))}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
          title="Renommer"
        >
          <Pencil className="h-4 w-4" />
        </button>
        {onShare && (
          <button
            onClick={(e) => handleAction(e, () => onShare(document))}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Partager"
          >
            <Share2 className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => handleAction(e, () => onDelete(document))}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
