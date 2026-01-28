import { useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, logout, setLoading, accessToken } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization (React StrictMode, HMR, etc.)
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      // Always wait for token refresh to complete before allowing API calls
      // This prevents 401 race conditions
      try {
        const refreshResponse = await authService.refreshToken(refreshToken);

        if (refreshResponse.user) {
          setAuth(refreshResponse.user, refreshResponse.accessToken);
          return;
        }

        useAuthStore.getState().setToken(refreshResponse.accessToken);
        const { user } = await authService.getMe();
        setAuth(user, refreshResponse.accessToken);
      } catch {
        localStorage.removeItem('refreshToken');
        logout();
      }
    };

    initAuth();
  }, [logout, setAuth, setLoading, accessToken]);

  return <>{children}</>;
}
