import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, setLoading, logout: clearAuth } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });

      // Store refresh token in localStorage
      localStorage.setItem('refreshToken', response.refreshToken);

      // Update store with user and access token
      setAuth(response.user, response.accessToken);

      return { success: true };
    } catch (error: unknown) {
      setLoading(false);
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
            'Identifiants invalides';
      return { success: false, error: message };
    }
  }, [setAuth, setLoading]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('refreshToken');
      clearAuth();
    }
  }, [clearAuth]);

  const checkAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      clearAuth();
      return false;
    }

    setLoading(true);
    try {
      const { user } = await authService.getMe();
      const token = useAuthStore.getState().accessToken;
      setAuth(user, token || '');
      return true;
    } catch {
      localStorage.removeItem('refreshToken');
      clearAuth();
      return false;
    }
  }, [clearAuth, setAuth, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
}
