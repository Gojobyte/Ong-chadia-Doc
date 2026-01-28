import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Toaster } from '@/components/ui/toaster';
import { Role } from '@ong-chadia/shared';

// Eagerly loaded pages (critical path)
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

// Lazy loaded pages (reduces initial bundle by ~500KB)
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const DocumentDetailPage = lazy(() => import('@/pages/DocumentDetailPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const ProjectCreatePage = lazy(() => import('@/pages/ProjectCreatePage'));
const ProjectEditPage = lazy(() => import('@/pages/ProjectEditPage'));
const AnalyticsDashboardPage = lazy(() => import('@/pages/AnalyticsDashboardPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const TagsAdminPage = lazy(() => import('@/pages/TagsAdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Loading fallback for lazy pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense>} />
            <Route path="/documents/:id" element={<Suspense fallback={<PageLoader />}><DocumentDetailPage /></Suspense>} />
            <Route path="/favorites" element={<Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense>} />
            <Route path="/search" element={<Suspense fallback={<PageLoader />}><SearchResultsPage /></Suspense>} />
            <Route path="/projects" element={<Suspense fallback={<PageLoader />}><ProjectsPage /></Suspense>} />
            <Route path="/projects/:id" element={<Suspense fallback={<PageLoader />}><ProjectDetailPage /></Suspense>} />
            <Route path="/projects/:id/edit" element={<Suspense fallback={<PageLoader />}><ProjectEditPage /></Suspense>} />

            {/* Staff/Admin routes */}
            <Route element={<RoleGuard roles={[Role.STAFF, Role.SUPER_ADMIN]} />}>
              <Route path="/projects/new" element={<Suspense fallback={<PageLoader />}><ProjectCreatePage /></Suspense>} />
              <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsDashboardPage /></Suspense>} />
            </Route>

            {/* Admin routes - Super Admin only */}
            <Route element={<RoleGuard roles={[Role.SUPER_ADMIN]} />}>
              <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><UsersPage /></Suspense>} />
              <Route path="/admin/tags" element={<Suspense fallback={<PageLoader />}><TagsAdminPage /></Suspense>} />
            </Route>
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
        </Routes>
        <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
