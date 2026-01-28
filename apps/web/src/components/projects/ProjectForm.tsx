import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectFormSchema, type ProjectFormData } from '@/lib/validations/project';
import { ProjectStatus, type ProjectWithCounts } from '@ong-chadia/shared';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  initialData?: ProjectWithCounts;
  isLoading?: boolean;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: ProjectStatus.DRAFT, label: 'Brouillon' },
  { value: ProjectStatus.PREPARATION, label: 'Préparation' },
  { value: ProjectStatus.IN_PROGRESS, label: 'En cours' },
  { value: ProjectStatus.COMPLETED, label: 'Terminé' },
  { value: ProjectStatus.CANCELLED, label: 'Annulé' },
];

export function ProjectForm({
  mode,
  initialData,
  isLoading,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || ProjectStatus.DRAFT,
      startDate: initialData?.startDate?.split('T')[0] || '',
      endDate: initialData?.endDate?.split('T')[0] || '',
      budget: initialData?.budget ? parseFloat(initialData.budget) : undefined,
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        startDate: initialData.startDate?.split('T')[0] || '',
        endDate: initialData.endDate?.split('T')[0] || '',
        budget: initialData.budget ? parseFloat(initialData.budget) : undefined,
      });
    }
  }, [initialData, reset]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleFormSubmit = (data: ProjectFormData) => {
    // Clean up empty strings to null
    const cleanedData = {
      ...data,
      description: data.description || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      budget: data.budget ?? undefined,
    };
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <Input
        label="Nom du projet *"
        placeholder="Ex: Construction école Ngaoundéré"
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Décrivez le projet, ses objectifs et son contexte..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Status */}
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Statut
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={errors.status ? 'border-red-300' : ''}>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Date de début
          </label>
          <input
            type="date"
            {...register('startDate')}
            className={`
              w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${errors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100'}
            `}
          />
          {errors.startDate && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Date de fin
          </label>
          <input
            type="date"
            {...register('endDate')}
            className={`
              w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${errors.endDate ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100'}
            `}
          />
          {errors.endDate && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Budget (XAF)
        </label>
        <input
          type="number"
          min="0"
          step="1000"
          placeholder="Ex: 5000000"
          {...register('budget', { valueAsNumber: true })}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${errors.budget ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100'}
          `}
        />
        {errors.budget && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">
            {errors.budget.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Créer le projet' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
