import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@ong-chadia/shared';

interface ProjectsEmptyStateProps {
  type: 'no-projects' | 'no-results';
  searchQuery?: string;
}

export function ProjectsEmptyState({ type, searchQuery }: ProjectsEmptyStateProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;

  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">
          Aucun résultat
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Aucun projet ne correspond à votre recherche
          {searchQuery && (
            <span className="font-medium"> "{searchQuery}"</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <FolderKanban className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Aucun projet
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        {isStaffOrAbove
          ? "Créez votre premier projet pour commencer à organiser le travail de l'équipe."
          : "Aucun projet n'est disponible pour le moment."}
      </p>
      {isStaffOrAbove && (
        <Button onClick={() => navigate('/projects/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Créer un projet
        </Button>
      )}
    </div>
  );
}
