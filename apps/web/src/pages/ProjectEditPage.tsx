import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { useProject, useUpdateProject, useProjectMembers } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@ong-chadia/shared';
import type { ProjectFormData } from '@/lib/validations/project';

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(id || null);
  const { data: membersData, isLoading: membersLoading } = useProjectMembers(id || null);
  const updateProject = useUpdateProject();

  const members = membersData?.data || [];

  // Check permissions
  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;
  const isProjectManager = members.some(
    (m) => m.user?.id === user?.id && m.role === 'PROJECT_MANAGER'
  );
  const canEdit = isStaffOrAbove || isProjectManager;

  const handleSubmit = async (data: ProjectFormData) => {
    if (!id) return;

    try {
      // Convert date strings to ISO datetime format for API
      const startDate = data.startDate ? new Date(data.startDate).toISOString() : null;
      const endDate = data.endDate ? new Date(data.endDate).toISOString() : null;

      await updateProject.mutateAsync({
        id,
        data: {
          name: data.name,
          description: data.description || null,
          status: data.status,
          startDate,
          endDate,
          budget: data.budget ?? null,
        },
      });
      navigate(`/projects/${id}`);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };

  // Loading state
  if (projectLoading || membersLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state or not found
  if (projectError || !project) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Projet non trouvé
            </h2>
            <p className="text-slate-500 mb-6">
              Ce projet n'existe pas ou vous n'avez pas les permissions.
            </p>
            <Button onClick={() => navigate('/projects')}>
              Retour aux projets
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Permission denied
  if (!canEdit) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Accès refusé
            </h2>
            <p className="text-slate-500 mb-6">
              Vous n'avez pas les permissions pour modifier ce projet.
            </p>
            <Button onClick={() => navigate(`/projects/${id}`)}>
              Voir le projet
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            to="/projects"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Projets
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link
            to={`/projects/${id}`}
            className="text-slate-500 hover:text-slate-700 transition-colors truncate max-w-[150px]"
          >
            {project.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">Modifier</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Modifier le projet</h1>
          <p className="text-sm text-slate-500 mt-1">
            Modifiez les informations du projet
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <ProjectForm
            mode="edit"
            initialData={project}
            isLoading={updateProject.isPending}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
