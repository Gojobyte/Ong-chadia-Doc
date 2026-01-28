import { useState } from 'react';
import { Trash2, ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectRole, type ProjectMember } from '@ong-chadia/shared';

interface MemberItemProps {
  member: ProjectMember;
  isLastPM: boolean;
  isUpdating: boolean;
  onRoleChange: (role: ProjectRole) => void;
  onRemove: () => void;
}

const roleConfig: Record<ProjectRole, { label: string; className: string }> = {
  [ProjectRole.PROJECT_MANAGER]: {
    label: 'Chef de projet',
    className: 'bg-amber-100 text-amber-800',
  },
  [ProjectRole.MEMBER]: {
    label: 'Membre',
    className: 'bg-blue-100 text-blue-800',
  },
  [ProjectRole.VOLUNTEER]: {
    label: 'Bénévole',
    className: 'bg-green-100 text-green-800',
  },
};

const roleOptions = [
  { value: ProjectRole.PROJECT_MANAGER, label: 'Chef de projet' },
  { value: ProjectRole.MEMBER, label: 'Membre' },
  { value: ProjectRole.VOLUNTEER, label: 'Bénévole' },
];

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

export function MemberItem({ member, isLastPM, isUpdating, onRoleChange, onRemove }: MemberItemProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const config = roleConfig[member.role] || roleConfig[ProjectRole.MEMBER];

  const handleRoleSelect = (role: ProjectRole) => {
    setRoleDropdownOpen(false);
    if (role !== member.role) {
      onRoleChange(role);
    }
  };

  const handleConfirmRemove = () => {
    setConfirmRemoveOpen(false);
    onRemove();
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
          {getInitials(member.user?.firstName, member.user?.lastName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {member.user?.firstName} {member.user?.lastName}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {member.user?.email}
          </p>
        </div>

        {/* Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            disabled={isUpdating}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors
              ${config.className}
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
            `}
          >
            {config.label}
            <ChevronDown className="w-3 h-3" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {roleOptions.map((option) => {
                    // Disable changing from PM to another role if last PM
                    const isDisabled = isLastPM && member.role === ProjectRole.PROJECT_MANAGER && option.value !== ProjectRole.PROJECT_MANAGER;

                    return (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && handleRoleSelect(option.value)}
                        disabled={isDisabled}
                        className={`
                          w-full px-3 py-2 text-left text-sm transition-colors
                          ${member.role === option.value ? 'bg-slate-50 font-medium' : ''}
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}
                        `}
                        title={isDisabled ? 'Dernier chef de projet' : undefined}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={() => setConfirmRemoveOpen(true)}
          disabled={isLastPM || isUpdating}
          className={`
            p-2 rounded-lg transition-colors
            ${isLastPM || isUpdating
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
            }
          `}
          title={isLastPM ? 'Impossible de retirer le dernier chef de projet' : 'Retirer du projet'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Confirm Remove Dialog */}
      {confirmRemoveOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setConfirmRemoveOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-xl z-[60] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Retirer le membre</h3>
                <p className="text-sm text-slate-500">Cette action est irréversible</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Êtes-vous sûr de vouloir retirer{' '}
              <span className="font-medium">{member.user?.firstName} {member.user?.lastName}</span>{' '}
              du projet ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmRemoveOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmRemove}
              >
                Retirer
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
