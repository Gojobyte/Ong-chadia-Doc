import { Tag as TagIcon } from 'lucide-react';
import { usePopularTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

interface TagCloudProps {
  onTagClick?: (tagId: string, tagName: string) => void;
  selectedTagId?: string | null;
  className?: string;
}

export function TagCloud({ onTagClick, selectedTagId, className }: TagCloudProps) {
  const { data: tags = [], isLoading } = usePopularTags(12);

  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <div className="flex items-center gap-2 mb-3">
          <TagIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-500">Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 w-16 bg-slate-100 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  // Calculate font size based on usage count
  const maxCount = Math.max(...tags.map((t) => t._count?.documents || 0));
  const minCount = Math.min(...tags.map((t) => t._count?.documents || 0));

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 'text-xs';
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.7) return 'text-sm font-medium';
    if (ratio > 0.3) return 'text-xs font-medium';
    return 'text-xs';
  };

  return (
    <div className={cn('p-4 border-t border-slate-100', className)}>
      <div className="flex items-center gap-2 mb-3">
        <TagIcon className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">Tags populaires</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const count = tag._count?.documents || 0;
          const isSelected = selectedTagId === tag.id;

          return (
            <button
              key={tag.id}
              onClick={() => onTagClick?.(tag.id, tag.name)}
              className={cn(
                'px-2 py-0.5 rounded-full transition-all hover:scale-105',
                getFontSize(count),
                isSelected
                  ? 'ring-2 ring-offset-1'
                  : 'hover:ring-1 hover:ring-offset-1'
              )}
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color,
                '--tw-ring-color': tag.color,
              } as React.CSSProperties}
              title={`${count} document${count !== 1 ? 's' : ''}`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
