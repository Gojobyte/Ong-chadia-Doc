import { useState } from 'react';
import { X, Users, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberItem } from './MemberItem';
import { AddMemberDialog } from './AddMemberDialog';
import { useProjectMembers, useUpdateProjectMemberRole, useRemoveProjectMember } from '@/hooks/useProjects';
import { ProjectRole, type ProjectMember } from '@ong-chadia/shared';

interface TeamManagementModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamManagementModal({ projectId, isOpen, onClose }: TeamManagementModalProps) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const { data: membersData, isLoading } = useProjectMembers(projectId);
  const updateRole = useUpdateProjectMemberRole();
  const removeMember = useRemoveProjectMember();

  const members = membersData?.data || [];

  // Check if member is the last PROJECT_MANAGER
  const isLastProjectManager = (memberId: string): boolean => {
    const member = members.find((m) => m.id === memberId);
    if (member?.role !== ProjectRole.PROJECT_MANAGER) return false;
    const pmCount = members.filter((m) => m.role === ProjectRole.PROJECT_MANAGER).length;
    return pmCount === 1;
  };

  const handleRoleChange = async (member: ProjectMember, newRole: ProjectRole) => {
    await updateRole.mutateAsync({
      projectId,
      memberId: member.id,
      data: { role: newRole },
    });
  };

  const handleRemove = async (member: ProjectMember) => {
    await removeMember.mutateAsync({
      projectId,
      memberId: member.id,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-xl shadow-xl z-50 flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Gérer l'équipe
              </h2>
              <p className="text-sm text-slate-500">
                {members.length} membre{members.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Add Member Button */}
        <div className="px-6 py-3 border-b border-slate-100">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setAddMemberOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un membre
          </Button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Aucun membre dans l'équipe</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  isLastPM={isLastProjectManager(member.id)}
                  isUpdating={updateRole.isPending || removeMember.isPending}
                  onRoleChange={(role) => handleRoleChange(member, role)}
                  onRemove={() => handleRemove(member)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      <AddMemberDialog
        projectId={projectId}
        isOpen={addMemberOpen}
        existingMemberIds={members.map((m) => m.user?.id || '')}
        onClose={() => setAddMemberOpen(false)}
      />
    </>
  );
}
