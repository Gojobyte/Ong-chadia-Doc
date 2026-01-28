import { ProjectStatus } from '@ong-chadia/shared';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  [ProjectStatus.DRAFT]: {
    label: 'Brouillon',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  [ProjectStatus.PREPARATION]: {
    label: 'Préparation',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  [ProjectStatus.IN_PROGRESS]: {
    label: 'En cours',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Terminé',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  [ProjectStatus.CANCELLED]: {
    label: 'Annulé',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export function ProjectStatusBadge({ status, size = 'md' }: ProjectStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[ProjectStatus.DRAFT];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.className}
        ${sizeClasses}
      `}
    >
      {config.label}
    </span>
  );
}
