import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, UserX } from 'lucide-react'
import type { User } from '@ong-chadia/shared'
import { RoleBadge } from './RoleBadge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserTable({ users, isLoading, onEdit, onDelete }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        Aucun utilisateur trouvé
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className={!user.isActive ? 'opacity-50 bg-slate-50' : ''}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  {!user.isActive && (
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Désactivé
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-slate-600">{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-slate-500">
                {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    {user.isActive && (
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Désactiver
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
