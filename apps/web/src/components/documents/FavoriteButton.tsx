import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsDocumentFavorite, useToggleDocumentFavorite } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  documentId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ documentId, className, size = 'md' }: FavoriteButtonProps) {
  const { data: isFavorite, isLoading: isCheckLoading } = useIsDocumentFavorite(documentId);
  const { toggle, isLoading: isToggleLoading } = useToggleDocumentFavorite();

  const isLoading = isCheckLoading || isToggleLoading;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLoading) return;
    await toggle(documentId, isFavorite || false);
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'rounded-lg transition-all duration-200 hover:scale-110',
        sizeClasses[size],
        isFavorite
          ? 'text-amber-500 hover:text-amber-600'
          : 'text-slate-400 hover:text-amber-500',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Star
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          isFavorite && 'fill-current'
        )}
      />
    </button>
  );
}
