import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Shield, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
      <main className="flex-1 overflow-y-auto bg-aurora relative">
        {/* Aurora orbs */}
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestion des utilisateurs
                  </h1>
                  <Sparkles className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-sm text-gray-500">
                  Créez et gérez les comptes utilisateurs de la plateforme.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="btn-aurora"
            >
              Ajouter utilisateur
            </Button>
          </motion.header>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-aurora p-5">
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
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UserTable
              users={data?.data || []}
              isLoading={isLoading}
              onEdit={(user) => setEditingUser(user)}
              onDelete={(user) => setDeletingUser(user)}
            />
          </motion.div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="glass-colored border-gray-200 text-gray-600 hover:bg-white/80"
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600 px-4 py-2 glass-colored rounded-lg border border-gray-200/50">
                Page {page} sur {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="glass-colored border-gray-200 text-gray-600 hover:bg-white/80"
              >
                Suivant
              </Button>
            </motion.div>
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
      </main>
    </DashboardLayout>
  )
}
