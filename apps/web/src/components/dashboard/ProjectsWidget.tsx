import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderKanban,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
// Direct import to avoid loading all 20+ components from barrel file
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import type { MyProject, ProjectStats } from '@/services/dashboard.service';

interface ProjectsWidgetProps {
  projects: MyProject[];
  stats: ProjectStats;
  isLoading?: boolean;
  canCreate?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PREPARATION: 'Préparation',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
};

function getDeadlineInfo(endDate: string | null): {
  daysRemaining: number | null;
  status: 'critical' | 'warning' | 'normal' | null;
} {
  if (!endDate) return { daysRemaining: null, status: null };

  const days = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return { daysRemaining: days, status: 'critical' };
  if (days <= 7) return { daysRemaining: days, status: 'critical' };
  if (days <= 14) return { daysRemaining: days, status: 'warning' };
  return { daysRemaining: days, status: 'normal' };
}

function ProjectsWidgetSkeleton() {
  return (
    <Card className="card-simple">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ProjectsWidget({
  projects,
  stats,
  isLoading,
  canCreate,
}: ProjectsWidgetProps) {
  if (isLoading) {
    return <ProjectsWidgetSkeleton />;
  }

  return (
    <Card className="card-simple">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Mes Projets</h3>
            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {stats.total}
            </span>
          </div>
          <div className="flex gap-1">
            {canCreate && (
              <Link to="/projects/new">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Status counters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {stats.byStatus.IN_PROGRESS > 0 && (
            <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
              {stats.byStatus.IN_PROGRESS} En cours
            </span>
          )}
          {stats.byStatus.PREPARATION > 0 && (
            <span className="text-xs font-medium px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">
              {stats.byStatus.PREPARATION} Préparation
            </span>
          )}
          {stats.byStatus.DRAFT > 0 && (
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {stats.byStatus.DRAFT} Brouillon
            </span>
          )}
          {stats.byStatus.COMPLETED > 0 && (
            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
              {stats.byStatus.COMPLETED} Terminé
            </span>
          )}
        </div>
      </div>

      {/* Projects list */}
      <div className="divide-y divide-gray-100">
        {projects.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">Aucun projet assigné</p>
            <p className="text-gray-500 text-sm mb-4">
              Vous n'êtes membre d'aucun projet
            </p>
            <Link to="/projects">
              <Button variant="outline" size="sm" className="btn-simple-outline">
                Voir tous les projets
              </Button>
            </Link>
          </div>
        ) : (
          projects.map((project) => {
            const deadline = getDeadlineInfo(project.endDate);

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    deadline.status === 'critical'
                      ? 'bg-red-50 text-red-600'
                      : deadline.status === 'warning'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-green-50 text-green-600'
                  }`}>
                    {deadline.status === 'critical' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : deadline.status === 'warning' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <FolderKanban className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ProjectStatusBadge status={project.status} />
                      {project.endDate && (
                        <span className="text-xs text-gray-500">
                          Échéance: {new Date(project.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {deadline.daysRemaining !== null && deadline.daysRemaining <= 14 && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 ${
                    deadline.status === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {deadline.daysRemaining < 0
                      ? 'En retard'
                      : deadline.daysRemaining === 0
                        ? "Aujourd'hui"
                        : deadline.daysRemaining === 1
                          ? 'Demain'
                          : `${deadline.daysRemaining}j`}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      {projects.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <Link
            to="/projects"
            className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir tous les projets
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
}
