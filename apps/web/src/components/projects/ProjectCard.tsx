import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Wallet } from 'lucide-react';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import type { ProjectWithCounts } from '@ong-chadia/shared';

interface ProjectCardProps {
  project: ProjectWithCounts;
  isMyProject?: boolean;
}

export function ProjectCard({ project, isMyProject }: ProjectCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = (amount: string | null): string => {
    if (!amount) return '-';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <article
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative bg-white rounded-xl border border-slate-200 p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
    >
      {/* My Project Badge */}
      {isMyProject && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-500 text-white shadow-sm">
            Mon projet
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <ProjectStatusBadge status={project.status} size="sm" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="truncate">
            {project.startDate ? formatDate(project.startDate) : 'Non défini'}
          </span>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Wallet className="w-4 h-4 text-slate-400" />
          <span className="truncate">{formatBudget(project.budget)}</span>
        </div>

        {/* Members */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{project._count?.members || 0} membre{(project._count?.members || 0) > 1 ? 's' : ''}</span>
        </div>

        {/* Documents */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{project._count?.documents || 0} doc{(project._count?.documents || 0) > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </article>
  );
}
