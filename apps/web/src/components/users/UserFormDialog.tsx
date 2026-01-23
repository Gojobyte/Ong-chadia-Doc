import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User } from '@ong-chadia/shared'
import { Role } from '@ong-chadia/shared'

const userFormSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères').optional().or(z.literal('')),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  role: z.nativeEnum(Role),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => Promise<void>
  user?: User | null
  isLoading: boolean
}

export function UserFormDialog({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
}: UserFormDialogProps) {
  const isEdit = !!user

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isEdit
        ? userFormSchema.omit({ password: true })
        : userFormSchema.refine((data) => data.password && data.password.length >= 8, {
            message: 'Minimum 8 caractères',
            path: ['password'],
          })
    ),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: Role.GUEST,
    },
  })

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          password: '',
        })
      } else {
        reset({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: Role.GUEST,
        })
      }
    }
  }, [user, reset, open])

  const handleFormSubmit = async (data: UserFormData) => {
    // Remove password for edit mode
    if (isEdit) {
      const { password: _, ...updateData } = data
      await onSubmit(updateData as UserFormData)
    } else {
      await onSubmit(data)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const selectedRole = watch('role')

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-red-500 text-xs">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe temporaire</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: string) => setValue('role', value as Role)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                <SelectItem value={Role.STAFF}>Staff</SelectItem>
                <SelectItem value={Role.CONTRIBUTOR}>Contributeur</SelectItem>
                <SelectItem value={Role.GUEST}>Invité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
