import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { UserTable } from '@/components/users/UserTable'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { UsersFilter } from '@/components/users/UsersFilter'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useUsers'
import type { User } from '@ong-chadia/shared'
import { Role } from '@ong-chadia/shared'
import type { CreateUserInput, UpdateUserInput } from '@/services/users.service'

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const page = Number(searchParams.get('page')) || 1
  const role = searchParams.get('role') as Role | undefined

  const { data, isLoading } = useUsers({ page, limit: 20, role })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const handleCreate = async (formData: CreateUserInput | UpdateUserInput) => {
    await createMutation.mutateAsync(formData as CreateUserInput)
    setDialogOpen(false)
  }

  const handleUpdate = async (formData: CreateUserInput | UpdateUserInput) => {
    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, data: formData as UpdateUserInput })
      setEditingUser(null)
    }
  }

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteMutation.mutateAsync(deletingUser.id)
      setDeletingUser(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage))
    setSearchParams(searchParams)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestion des utilisateurs
            </h1>
            <p className="text-slate-600">
              Créez et gérez les comptes utilisateurs de la plateforme.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
            Ajouter utilisateur
          </Button>
        </div>

        {/* Filter */}
        <Card className="p-4">
          <UsersFilter
            role={role}
            onRoleChange={(newRole) => {
              if (newRole) {
                searchParams.set('role', newRole)
              } else {
                searchParams.delete('role')
              }
              searchParams.delete('page')
              setSearchParams(searchParams)
            }}
          />
        </Card>

        {/* Table */}
        <UserTable
          users={data?.data || []}
          isLoading={isLoading}
          onEdit={(user) => setEditingUser(user)}
          onDelete={(user) => setDeletingUser(user)}
        />

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-slate-600">
              Page {page} sur {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <UserFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />

        {/* Edit Dialog */}
        <UserFormDialog
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
          user={editingUser}
          isLoading={updateMutation.isPending}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
          title="Désactiver l'utilisateur"
          message={`Êtes-vous sûr de vouloir désactiver ${deletingUser?.firstName} ${deletingUser?.lastName} ?`}
          isLoading={deleteMutation.isPending}
          confirmText="Désactiver"
        />
      </div>
    </DashboardLayout>
  )
}
