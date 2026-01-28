import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ProjectHeader,
  ProjectDescription,
  ProjectBudget,
  ProjectProgress,
  ProjectTeam,
  ProjectDocuments,
  ProjectDetailSkeleton,
  TeamManagementModal,
} from '@/components/projects';
import { LinkDocumentsModal } from '@/components/projects/LinkDocumentsModal';
import { Button } from '@/components/ui/button';
import { useProject, useProjectMembers, useProjectDocuments } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@ong-chadia/shared';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);

  // Fetch project data
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(id || null);
  const { data: membersData, isLoading: membersLoading } = useProjectMembers(id || null);
  const { data: documentsData, isLoading: documentsLoading } = useProjectDocuments(id || null);

  const members = membersData?.data || [];
  const documents = documentsData?.data || [];

  // Check permissions
  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;
  const isProjectManager = members.some(
    (m) => m.user?.id === user?.id && m.role === 'PROJECT_MANAGER'
  );
  const isMember = members.some((m) => m.user?.id === user?.id);
  const canEdit = isStaffOrAbove || isProjectManager;
  const canLinkDocuments = isStaffOrAbove || isMember;

  // Handle team management
  const handleManageTeam = () => {
    setTeamModalOpen(true);
  };

  // Handle link documents
  const handleLinkDocuments = () => {
    setDocumentsModalOpen(true);
  };

  // Loading state
  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <ProjectDetailSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (projectError || !project) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Projet non trouvé
            </h2>
            <p className="text-slate-500 mb-6 text-center">
              Ce projet n'existe pas ou vous n'avez pas les permissions pour y accéder.
            </p>
            <Button onClick={() => navigate('/projects')}>
              Retour aux projets
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            to="/projects"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Projets
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium truncate max-w-[200px]">
            {project.name}
          </span>
        </nav>

        {/* Header */}
        <ProjectHeader
          project={project}
          members={members}
          onManageTeam={handleManageTeam}
        />

        {/* Content */}
        <div className="mt-6 space-y-6">
          {/* Description & Budget Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectDescription description={project.description} />
            <ProjectBudget budget={project.budget} />
          </div>

          {/* Progress */}
          <ProjectProgress status={project.status} />

          {/* Team & Documents Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectTeam
              members={members}
              isLoading={membersLoading}
              canManage={canEdit}
              onManage={handleManageTeam}
            />
            <ProjectDocuments
              documents={documents}
              isLoading={documentsLoading}
              canLink={canLinkDocuments}
              onLinkDocuments={handleLinkDocuments}
            />
          </div>
        </div>
      </div>

      {/* Team Management Modal */}
      {id && (
        <TeamManagementModal
          projectId={id}
          isOpen={teamModalOpen}
          onClose={() => setTeamModalOpen(false)}
        />
      )}

      {/* Link Documents Modal */}
      {id && (
        <LinkDocumentsModal
          projectId={id}
          existingDocumentIds={documents.map((d) => d.documentId)}
          isOpen={documentsModalOpen}
          onClose={() => setDocumentsModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
