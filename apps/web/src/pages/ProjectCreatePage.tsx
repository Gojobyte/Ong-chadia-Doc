import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useCreateProject } from '@/hooks/useProjects';
import type { ProjectFormData } from '@/lib/validations/project';

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      // Convert date strings to ISO datetime format for API
      const startDate = data.startDate ? new Date(data.startDate).toISOString() : undefined;
      const endDate = data.endDate ? new Date(data.endDate).toISOString() : undefined;

      const project = await createProject.mutateAsync({
        name: data.name,
        description: data.description,
        status: data.status,
        startDate,
        endDate,
        budget: data.budget ?? undefined,
      });
      navigate(`/projects/${project.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

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
          <span className="text-slate-900 font-medium">Nouveau projet</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Nouveau projet</h1>
          <p className="text-sm text-slate-500 mt-1">
            Créez un nouveau projet pour l'organisation
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <ProjectForm
            mode="create"
            isLoading={createProject.isPending}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
