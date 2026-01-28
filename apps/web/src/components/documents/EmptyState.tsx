import { FolderOpen, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-folder' | 'empty-folder' | 'no-results';
  searchQuery?: string;
  onUploadClick?: () => void;
}

export function EmptyState({ type = 'empty-folder', searchQuery, onUploadClick }: EmptyStateProps) {
  if (type === 'no-folder') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <FolderOpen className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Sélectionnez un dossier
        </h3>
        <p className="text-slate-500 max-w-sm">
          Choisissez un dossier dans l'arborescence pour voir ses documents.
        </p>
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucun résultat
        </h3>
        <p className="text-slate-500 max-w-sm">
          Aucun document ne correspond à "{searchQuery}".
          <br />
          Essayez avec d'autres termes de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Aucun document
      </h3>
      <p className="text-slate-500 max-w-sm mb-8">
        Ce dossier est vide. Téléversez votre premier document pour commencer.
      </p>
      {onUploadClick && (
        <button
          onClick={onUploadClick}
          className="inline-flex items-center px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Téléverser un document
        </button>
      )}
    </div>
  );
}
