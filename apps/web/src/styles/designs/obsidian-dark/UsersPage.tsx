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
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
        {/* Background glow effects */}
        <div className="fixed top-20 right-40 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-20 left-20 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">
                    Gestion des utilisateurs
                  </h1>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm text-slate-400">
                  Créez et gérez les comptes utilisateurs de la plateforme.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="btn-neon"
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
            <Card className="card-obsidian p-5">
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
                className="btn-ghost-dark"
              >
                Précédent
              </Button>
              <span className="text-sm text-slate-300 px-4 py-2 bg-slate-800/50 rounded-lg border border-white/[0.06]">
                Page {page} sur {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="btn-ghost-dark"
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
