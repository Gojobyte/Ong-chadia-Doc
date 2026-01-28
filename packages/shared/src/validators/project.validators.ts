import { z } from 'zod';

// Project Status Enum Schema
export const projectStatusSchema = z.enum([
  'DRAFT',
  'PREPARATION',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

// Create Project Schema
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z.string().max(5000, 'La description ne peut pas dépasser 5000 caractères').optional(),
  status: projectStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive('Le budget doit être positif').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate'],
  }
);

// Update Project Schema
export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Le nom ne peut pas être vide').max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: projectStatusSchema.optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  budget: z.number().positive('Le budget doit être positif').nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ doit être fourni' }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate'],
  }
);

// Project Query Params Schema
export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['name', 'createdAt', 'startDate', 'endDate', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().optional(), // Can be comma-separated
  search: z.string().optional(),
});

// Project ID Param Schema
export const projectIdSchema = z.object({
  id: z.string().uuid('ID de projet invalide'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
