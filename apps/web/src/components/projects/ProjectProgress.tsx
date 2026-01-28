import { Check, X } from 'lucide-react';
import { ProjectStatus } from '@ong-chadia/shared';

interface ProjectProgressProps {
  status: ProjectStatus;
}

const phases = [
  { status: ProjectStatus.DRAFT, label: 'Brouillon' },
  { status: ProjectStatus.PREPARATION, label: 'Préparation' },
  { status: ProjectStatus.IN_PROGRESS, label: 'En cours' },
  { status: ProjectStatus.COMPLETED, label: 'Terminé' },
];

const statusOrder: Record<ProjectStatus, number> = {
  [ProjectStatus.DRAFT]: 0,
  [ProjectStatus.PREPARATION]: 1,
  [ProjectStatus.IN_PROGRESS]: 2,
  [ProjectStatus.COMPLETED]: 3,
  [ProjectStatus.CANCELLED]: -1,
};

export function ProjectProgress({ status }: ProjectProgressProps) {
  // Handle cancelled status differently
  if (status === ProjectStatus.CANCELLED) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-600">Projet annulé</p>
            <p className="text-sm text-slate-500">Ce projet a été annulé</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPhaseIndex = statusOrder[status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-6">Avancement</h3>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary-500 transition-all duration-500"
          style={{
            width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const isCompleted = index < currentPhaseIndex;
            const isCurrent = index === currentPhaseIndex;

            return (
              <div key={phase.status} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${isCompleted
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : isCurrent
                      ? 'bg-white border-primary-500 text-primary-500'
                      : 'bg-white border-slate-200 text-slate-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
                  `}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
