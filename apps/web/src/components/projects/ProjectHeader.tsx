import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Edit, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProject } from '@/hooks/useProjects';
import { Role, ProjectStatus, type ProjectWithCounts, type ProjectMember } from '@ong-chadia/shared';

interface ProjectHeaderProps {
  project: ProjectWithCounts;
  members?: ProjectMember[];
  onManageTeam?: () => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: ProjectStatus.DRAFT, label: 'Brouillon' },
  { value: ProjectStatus.PREPARATION, label: 'Préparation' },
  { value: ProjectStatus.IN_PROGRESS, label: 'En cours' },
  { value: ProjectStatus.COMPLETED, label: 'Terminé' },
  { value: ProjectStatus.CANCELLED, label: 'Annulé' },
];

export function ProjectHeader({ project, members = [], onManageTeam }: ProjectHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProject = useUpdateProject();
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Check if user can edit
  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;
  const isProjectManager = members.some(
    (m) => m.user?.id === user?.id && m.role === 'PROJECT_MANAGER'
  );
  const canEdit = isStaffOrAbove || isProjectManager;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Non défini';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    setStatusDropdownOpen(false);
    await updateProject.mutateAsync({
      id: project.id,
      data: { status },
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left side - Title and Status */}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>

            {/* Status Badge - Editable for Staff+ */}
            {canEdit ? (
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <ProjectStatusBadge status={project.status} />
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {statusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setStatusDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            disabled={updateProject.isPending}
                            className={`
                              w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors
                              ${project.status === option.value ? 'bg-slate-50 font-medium' : ''}
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <ProjectStatusBadge status={project.status} />
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {formatDate(project.startDate)}
              {project.endDate && (
                <>
                  <span className="mx-2">→</span>
                  {formatDate(project.endDate)}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Right side - Actions */}
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onManageTeam}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Gérer l'équipe</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
