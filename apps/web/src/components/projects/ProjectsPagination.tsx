import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ProjectsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: ProjectsPaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-4 border-t border-slate-200">
      {/* Info */}
      <p className="text-sm text-slate-600">
        Affichage de <span className="font-medium">{start}</span> à{' '}
        <span className="font-medium">{end}</span> sur{' '}
        <span className="font-medium">{total}</span> projets
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNum, idx) => (
          <button
            key={idx}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            disabled={pageNum === '...'}
            className={`
              min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors
              ${pageNum === page
                ? 'bg-primary-500 text-white'
                : pageNum === '...'
                ? 'text-slate-400 cursor-default'
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            {pageNum}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
