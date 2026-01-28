import { z } from 'zod';
import { ProjectStatus } from '@ong-chadia/shared';

export const projectFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z.string().max(5000, 'La description ne peut pas dépasser 5000 caractères').optional(),
  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: 'Statut invalide' }),
  }),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z
    .number()
    .min(0, 'Le budget ne peut pas être négatif')
    .optional()
    .nullable(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  }
);

export type ProjectFormData = z.infer<typeof projectFormSchema>;
