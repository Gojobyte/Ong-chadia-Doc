import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, logout, setLoading, accessToken } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      // If we have a refresh token but no access token, try to get one
      if (!accessToken) {
        try {
          const refreshResponse = await authService.refreshToken(refreshToken);
          useAuthStore.getState().setToken(refreshResponse.accessToken);
        } catch {
          localStorage.removeItem('refreshToken');
          logout();
          return;
        }
      }

      // Verify the token by getting user info
      try {
        const { user } = await authService.getMe();
        const token = useAuthStore.getState().accessToken;
        setAuth(user, token || '');
      } catch {
        localStorage.removeItem('refreshToken');
        logout();
      }
    };

    initAuth();
  }, [accessToken, logout, setAuth, setLoading]);

  return <>{children}</>;
}
