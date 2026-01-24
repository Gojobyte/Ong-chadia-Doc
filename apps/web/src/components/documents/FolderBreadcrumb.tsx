import { ChevronRight, Home, Loader2 } from 'lucide-react';
import { useFolderPath } from '@/hooks/useFolders';

interface FolderBreadcrumbProps {
  folderId: string | null;
  onNavigate: (folderId: string | null) => void;
}

export function FolderBreadcrumb({ folderId, onNavigate }: FolderBreadcrumbProps) {
  const { data: path, isLoading } = useFolderPath(folderId);

  return (
    <nav className="flex items-center gap-1 text-sm mb-4">
      {/* Home / Root */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
      >
        <Home className="w-4 h-4" />
        <span>Documents</span>
      </button>

      {isLoading ? (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </>
      ) : (
        path?.map((folder, index) => (
          <div key={folder.id} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => onNavigate(folder.id)}
              className={`px-2 py-1 rounded hover:bg-slate-100 transition-colors ${
                index === path.length - 1
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {folder.name}
            </button>
          </div>
        ))
      )}
    </nav>
  );
}
