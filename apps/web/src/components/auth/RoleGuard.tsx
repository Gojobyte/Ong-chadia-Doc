import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Role } from '@ong-chadia/shared';

interface RoleGuardProps {
  roles: Role[];
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  // Vérification avec comparaison de string directe
  const hasRequiredRole = user && roles.some(role => role === user.role);

  if (!user || !hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
