import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/ui/password-input';
import { cn } from '@/lib/utils';

const REMEMBERED_EMAIL_KEY = 'remembered_email';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [shouldShake, setShouldShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
      password: '',
      rememberMe: !!localStorage.getItem(REMEMBERED_EMAIL_KEY),
    },
  });

  const rememberMe = watch('rememberMe');

  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFormSubmit = async (data: LoginFormData) => {
    // Handle remember me
    if (data.rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    await onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-4', shouldShake && 'animate-shake')}
      noValidate
    >
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={cn(
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            errors.email && 'border-red-500'
          )}
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <PasswordInput
          id="password"
          placeholder="********"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={cn(
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            errors.password && 'border-red-500'
          )}
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
            disabled={isLoading}
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-normal cursor-pointer"
          >
            Se souvenir de moi
          </Label>
        </div>
        <Link
          to="/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          Mot de passe oublié?
        </Link>
      </div>

      {/* API Error */}
      {error && (
        <div
          role="alert"
          className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        disabled={isLoading}
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  );
}

export type { LoginFormData };
