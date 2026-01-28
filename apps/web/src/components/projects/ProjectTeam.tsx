import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Role, ProjectRole, type ProjectMember } from '@ong-chadia/shared';

interface ProjectTeamProps {
  members: ProjectMember[];
  isLoading?: boolean;
  canManage?: boolean;
  onManage?: () => void;
}

const roleLabels: Record<ProjectRole, { label: string; className: string }> = {
  [ProjectRole.PROJECT_MANAGER]: {
    label: 'Chef de projet',
    className: 'bg-purple-100 text-purple-700',
  },
  [ProjectRole.MEMBER]: {
    label: 'Membre',
    className: 'bg-blue-100 text-blue-700',
  },
  [ProjectRole.VOLUNTEER]: {
    label: 'Bénévole',
    className: 'bg-green-100 text-green-700',
  },
};

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

export function ProjectTeam({ members, isLoading, canManage, onManage }: ProjectTeamProps) {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">
            Équipe ({members.length})
          </h3>
        </div>
        {canManage && (
          <Button variant="ghost" size="sm" onClick={onManage} className="gap-1">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Gérer</span>
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">
          Aucun membre assigné
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const roleConfig = roleLabels[member.role] || roleLabels[ProjectRole.MEMBER];
            const isCurrentUser = member.user?.id === user?.id;

            return (
              <div
                key={member.id}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-colors
                  ${isCurrentUser ? 'bg-primary-50' : 'hover:bg-slate-50'}
                `}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-medium text-slate-600">
                  {getInitials(member.user?.firstName, member.user?.lastName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {member.user?.firstName} {member.user?.lastName}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-primary-600">(vous)</span>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {member.user?.email}
                  </p>
                </div>

                {/* Role Badge */}
                <span
                  className={`
                    px-2 py-0.5 text-xs font-medium rounded-full
                    ${roleConfig.className}
                  `}
                >
                  {roleConfig.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
