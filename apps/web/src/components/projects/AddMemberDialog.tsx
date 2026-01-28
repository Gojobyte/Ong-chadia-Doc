import { useState, useMemo } from 'react';
import { X, Search, Loader2, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useUsers } from '@/hooks/useUsers';
import { useAddProjectMember } from '@/hooks/useProjects';
import { ProjectRole, Role, type User } from '@ong-chadia/shared';

interface AddMemberDialogProps {
  projectId: string;
  isOpen: boolean;
  existingMemberIds: string[];
  onClose: () => void;
}

const roleOptions = [
  { value: ProjectRole.PROJECT_MANAGER, label: 'Chef de projet' },
  { value: ProjectRole.MEMBER, label: 'Membre' },
  { value: ProjectRole.VOLUNTEER, label: 'Bénévole' },
];

const systemRoleLabels: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.STAFF]: 'Staff',
  [Role.CONTRIBUTOR]: 'Contributeur',
  [Role.GUEST]: 'Invité',
};

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

export function AddMemberDialog({ projectId, isOpen, existingMemberIds, onClose }: AddMemberDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const addMember = useAddProjectMember();

  // Fetch all active users
  const { data: usersData, isLoading: usersLoading } = useUsers({
    isActive: true,
    limit: 100,
  });

  // Filter users: exclude existing members and filter by search term
  const availableUsers = useMemo(() => {
    const allUsers = usersData?.data || [];
    return allUsers.filter((user) => {
      // Exclude already assigned users
      if (existingMemberIds.includes(user.id)) return false;

      // Filter by search term
      if (debouncedSearch.trim()) {
        const searchLower = debouncedSearch.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [usersData?.data, existingMemberIds, debouncedSearch]);

  const handleAddMember = async () => {
    if (!selectedUser) return;

    await addMember.mutateAsync({
      projectId,
      data: {
        userId: selectedUser.id,
        role: selectedRole,
      },
    });

    // Reset and close
    setSearch('');
    setSelectedUser(null);
    setSelectedRole(ProjectRole.MEMBER);
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    setSelectedUser(null);
    setSelectedRole(ProjectRole.MEMBER);
    onClose();
  };

  if (!isOpen) return null;

  const currentRoleOption = roleOptions.find((r) => r.value === selectedRole);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[70] animate-in fade-in"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-xl shadow-xl z-[70] flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Ajouter un membre
              </h2>
              <p className="text-sm text-slate-500">
                Rechercher et sélectionner un utilisateur
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Users List */}
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-2">
              Utilisateurs disponibles
            </p>
            <div className="border border-slate-200 rounded-lg max-h-[200px] overflow-y-auto">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400">
                    {search ? 'Aucun résultat' : 'Aucun utilisateur disponible'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`
                          w-full flex items-center gap-3 p-3 text-left transition-colors
                          ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'}
                        `}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
                          {getInitials(user.firstName, user.lastName)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        {/* System Role */}
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {systemRoleLabels[user.role]}
                        </span>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          {selectedUser && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                Rôle dans le projet
              </p>
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 hover:border-slate-300 transition-colors"
                >
                  {currentRoleOption?.label}
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {roleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setRoleDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        {roleOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedRole(option.value);
                              setRoleDropdownOpen(false);
                            }}
                            className={`
                              w-full px-3 py-2 text-left text-sm transition-colors
                              ${selectedRole === option.value ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleAddMember}
            disabled={!selectedUser || addMember.isPending}
          >
            {addMember.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Ajout...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
