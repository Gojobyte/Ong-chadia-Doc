# 10. Frontend Architecture

## 10.1 Component Organization

```
apps/web/src/
├── components/
│   ├── ui/                    # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/                # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── PageHeader.tsx
│   │
│   ├── auth/                  # Auth-specific components
│   │   ├── LoginForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   │
│   ├── dashboard/             # Dashboard widgets
│   │   ├── StatsCards.tsx
│   │   ├── ProjectsWidget.tsx
│   │   ├── DocumentsWidget.tsx
│   │   └── DeadlinesWidget.tsx
│   │
│   ├── documents/             # GED components
│   │   ├── FolderTree.tsx
│   │   ├── DocumentList.tsx
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentDetails.tsx
│   │   ├── UploadDropzone.tsx
│   │   ├── ShareDialog.tsx
│   │   └── VersionHistory.tsx
│   │
│   ├── projects/              # Project components
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── TeamManager.tsx
│   │   └── LinkedDocuments.tsx
│   │
│   ├── users/                 # User management
│   │   ├── UserTable.tsx
│   │   └── UserFormDialog.tsx
│   │
│   └── shared/                # Reusable components
│       ├── GlobalSearch.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ConfirmDialog.tsx
│       ├── StatusBadge.tsx
│       └── FileIcon.tsx
│
├── pages/                     # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── DocumentsPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── UsersPage.tsx
│   ├── NotFoundPage.tsx
│   └── ErrorPage.tsx
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   ├── useDocuments.ts
│   ├── useFolders.ts
│   ├── useProjects.ts
│   ├── useUsers.ts
│   ├── useDashboard.ts
│   └── useDebounce.ts
│
├── services/                  # API client services
│   ├── api.ts
│   ├── auth.service.ts
│   ├── documents.service.ts
│   ├── folders.service.ts
│   ├── projects.service.ts
│   ├── users.service.ts
│   └── dashboard.service.ts
│
├── stores/                    # Zustand stores
│   └── auth.store.ts
│
├── lib/                       # Utilities
│   ├── utils.ts
│   └── constants.ts
│
├── styles/
│   └── globals.css
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## 10.2 State Management

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@ong-chadia/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isLoading: false }),

      setToken: (accessToken) =>
        set({ accessToken }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      setLoading: (isLoading) =>
        set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

**State Management Patterns:**
- **Server State (TanStack Query):** Toutes les données API
- **Client State (Zustand):** État auth uniquement
- **URL State (React Router):** Filtres, pagination
- **Component State (useState):** État UI local

## 10.3 Routing Architecture

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Role } from '@ong-chadia/shared';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:folderId" element={<DocumentsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectDetailPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />

            {/* Admin only */}
            <Route element={<RoleGuard roles={[Role.SUPER_ADMIN]} />}>
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 10.4 API Client Setup

```typescript
// services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: localStorage.getItem('refreshToken'),
        });

        useAuthStore.getState().setToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---
