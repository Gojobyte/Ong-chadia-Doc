# 6. Components

## 6.1 Backend Components

### Auth Module
- **Responsibility:** Gestion de l'authentification et des tokens JWT
- **Key Interfaces:**
  - `AuthService.register(data)` → User
  - `AuthService.login(email, password)` → { accessToken, refreshToken, user }
  - `AuthService.refresh(refreshToken)` → { accessToken }
  - `AuthService.validateToken(token)` → TokenPayload
- **Dependencies:** UserRepository, bcrypt, jsonwebtoken

### User Module
- **Responsibility:** CRUD utilisateurs et gestion des rôles
- **Key Interfaces:**
  - `UserService.findAll(filters, pagination)` → PaginatedUsers
  - `UserService.findById(id)` → User
  - `UserService.create(data)` → User
  - `UserService.update(id, data)` → User
  - `UserService.deactivate(id)` → void

### Folder Module
- **Responsibility:** Gestion de l'arborescence des dossiers et permissions
- **Key Interfaces:**
  - `FolderService.getRootFolders(userId)` → Folder[]
  - `FolderService.getById(id, userId)` → FolderWithChildren
  - `FolderService.create(data, userId)` → Folder
  - `PermissionService.canAccess(userId, folderId, permission)` → boolean

### Document Module
- **Responsibility:** Upload, stockage, versioning et partage des documents
- **Key Interfaces:**
  - `DocumentService.upload(file, folderId, userId)` → Document
  - `DocumentService.getById(id)` → DocumentWithDetails
  - `DocumentService.getDownloadUrl(id)` → string (signed URL)
  - `DocumentService.search(query, filters, userId)` → PaginatedDocuments
  - `ShareService.createLink(documentId, duration, userId)` → ShareLink

### Project Module
- **Responsibility:** Gestion des projets, équipes et liaison documents
- **Key Interfaces:**
  - `ProjectService.findAll(filters, pagination)` → PaginatedProjects
  - `ProjectService.findById(id)` → ProjectWithDetails
  - `ProjectService.create(data, userId)` → Project
  - `MemberService.addMember(projectId, userId, role)` → ProjectMember

### Dashboard Module
- **Responsibility:** Agrégation des données pour le tableau de bord
- **Key Interfaces:**
  - `DashboardService.getAggregatedData(userId)` → DashboardData
  - `DashboardService.getRecentActivity(userId, limit)` → ActivityItem[]

## 6.2 Frontend Components

### Auth Components
- `<LoginPage />` - Formulaire de connexion
- `<ProtectedRoute />` - HOC pour routes authentifiées
- `useAuth()` - Hook pour état auth (user, login, logout)

### Layout Components
- `<AppLayout />` - Layout principal avec sidebar/navbar
- `<Sidebar />` - Navigation latérale
- `<Navbar />` - Barre supérieure avec user menu
- `<Breadcrumb />` - Fil d'Ariane

### Dashboard Components
- `<DashboardPage />` - Page principale
- `<ProjectsWidget />` - Mes projets récents
- `<DocumentsWidget />` - Documents récents
- `<DeadlinesWidget />` - Échéances proches

### GED Components
- `<DocumentsPage />` - Page principale GED
- `<FolderTree />` - Arborescence dossiers (sidebar)
- `<DocumentList />` - Liste documents du dossier actif
- `<DocumentDetails />` - Drawer détails document
- `<UploadDropzone />` - Zone d'upload drag & drop
- `<ShareDialog />` - Modal de partage

### Project Components
- `<ProjectsPage />` - Liste des projets
- `<ProjectCard />` - Card projet pour liste
- `<ProjectDetailPage />` - Page détail projet
- `<ProjectForm />` - Formulaire création/édition
- `<TeamManager />` - Gestion équipe projet

### Admin Components
- `<UsersPage />` - Liste des utilisateurs
- `<UserTable />` - Tableau utilisateurs avec actions
- `<UserFormDialog />` - Modal création/édition utilisateur

### Shared UI Components
- `<GlobalSearch />` - Barre de recherche globale
- `<LoadingSkeleton />` - Placeholder chargement
- `<EmptyState />` - État vide avec CTA
- `<ConfirmDialog />` - Confirmation actions destructives
- `<StatusBadge />` - Badge coloré pour statuts

## 6.3 Component Diagram

```mermaid
graph TB
    subgraph "Frontend - React SPA"
        subgraph "Pages"
            Login[LoginPage]
            Dashboard[DashboardPage]
            Documents[DocumentsPage]
            Projects[ProjectsPage]
            Admin[UsersPage]
        end

        subgraph "State & Services"
            AuthStore[Auth Store<br/>Zustand]
            QueryClient[TanStack Query<br/>Cache]
            ApiClient[API Client<br/>Axios]
        end
    end

    subgraph "Backend - Express API"
        subgraph "Routes Layer"
            AuthRoutes[/auth/*]
            UserRoutes[/users/*]
            FolderRoutes[/folders/*]
            DocRoutes[/documents/*]
            ProjectRoutes[/projects/*]
        end

        subgraph "Services"
            AuthSvc[AuthService]
            UserSvc[UserService]
            FolderSvc[FolderService]
            DocSvc[DocumentService]
            ProjectSvc[ProjectService]
        end

        subgraph "Data Access"
            Prisma[Prisma Client]
            Storage[Storage Client]
        end
    end

    subgraph "External Services"
        DB[(PostgreSQL)]
        S3[Supabase Storage]
    end

    QueryClient --> ApiClient
    ApiClient --> AuthRoutes
    ApiClient --> DocRoutes

    AuthSvc --> Prisma
    DocSvc --> Prisma
    DocSvc --> Storage

    Prisma --> DB
    Storage --> S3
```

---
