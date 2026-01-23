# Plateforme de Gestion ONG Chadia - Architecture Document

**Version:** 1.0
**Date:** 2026-01-20
**Auteur:** Winston (Architect Agent)
**Statut:** Finalisé - Prêt pour Développement

---

## Table des Matières

1. [Introduction](#1-introduction)
2. [High Level Architecture](#2-high-level-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Data Models](#4-data-models)
5. [API Specification](#5-api-specification)
6. [Components](#6-components)
7. [External APIs](#7-external-apis)
8. [Core Workflows](#8-core-workflows)
9. [Database Schema](#9-database-schema)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Backend Architecture](#11-backend-architecture)
12. [Unified Project Structure](#12-unified-project-structure)
13. [Development Workflow](#13-development-workflow)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Security and Performance](#15-security-and-performance)
16. [Testing Strategy](#16-testing-strategy)
17. [Coding Standards](#17-coding-standards)
18. [Error Handling Strategy](#18-error-handling-strategy)
19. [Monitoring and Observability](#19-monitoring-and-observability)
20. [Checklist Results](#20-checklist-results)

---

## 1. Introduction

Ce document définit l'architecture full-stack complète pour la **Plateforme de Gestion ONG Chadia**, couvrant le backend, le frontend et leur intégration. Il servira de source de vérité unique pour le développement guidé par IA.

Cette approche unifiée combine ce qui serait traditionnellement des documents d'architecture backend et frontend séparés, simplifiant le processus de développement pour les applications full-stack modernes où ces préoccupations sont de plus en plus liées.

### 1.1 Starter Template ou Projet Existant

**N/A - Projet Greenfield**

Ce projet est créé from scratch sans template de démarrage existant.

**Stack retenue (alignée avec PRD):**
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **DB/Storage**: Supabase (PostgreSQL + Storage)
- **Déploiement**: Vercel (frontend) + Railway (backend)
- **Monorepo**: pnpm workspaces (simple, efficace pour développeur solo)

### 1.2 Change Log

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-20 | 1.0 | Document initial complet | Winston (Architect) |

---

## 2. High Level Architecture

### 2.1 Technical Summary

L'architecture de la Plateforme ONG Chadia suit un modèle **monolithe modulaire** déployé sur une infrastructure cloud 100% gratuite. Le frontend React SPA communique avec une API REST Express.js via HTTPS. L'authentification utilise JWT avec refresh tokens. Les données sont stockées dans PostgreSQL (Supabase) et les fichiers dans Supabase Storage (S3-compatible). Cette architecture privilégie la simplicité et la rapidité de développement pour un MVP en 4 semaines, tout en restant évolutive vers des microservices si nécessaire.

### 2.2 Platform and Infrastructure Choice

**Analyse des options:**

| Option | Pros | Cons |
|--------|------|------|
| **Vercel + Supabase** ✅ | Gratuit, DX excellente, intégration native, auth/storage inclus | Limites tier gratuit, vendor lock-in |
| **AWS Full Stack** | Scalabilité illimitée, services complets | Complexe, coûts imprévisibles, overkill pour MVP |
| **Railway + Supabase** | Simple, gratuit 500h/mois, PostgreSQL inclus | Limites compute, cold starts |

**Choix retenu: Vercel (Frontend) + Railway (Backend) + Supabase (DB/Storage)**

- **Platform:** Multi-cloud (Vercel + Railway + Supabase)
- **Key Services:**
  - Vercel Edge Network (frontend hosting, CDN)
  - Railway (Node.js backend hosting)
  - Supabase PostgreSQL (database)
  - Supabase Storage (file storage, S3-compatible)
- **Deployment Regions:** Europe (Frankfurt) - proche du Tchad

### 2.3 Repository Structure

- **Structure:** Monorepo
- **Monorepo Tool:** pnpm workspaces (natif, léger, performant)
- **Package Organization:**
  - `apps/web` - Frontend React
  - `apps/api` - Backend Express
  - `packages/shared` - Types TypeScript, constantes, utilitaires partagés

### 2.4 High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[🌐 Browser]
        Mobile[📱 Mobile Browser]
    end

    subgraph "CDN & Frontend"
        Vercel[Vercel Edge Network]
        React[React SPA<br/>apps/web]
    end

    subgraph "API Layer"
        Railway[Railway Container]
        Express[Express.js API<br/>apps/api]
        Auth[Auth Middleware]
        RBAC[RBAC Guards]
    end

    subgraph "Data Layer"
        Supabase[(Supabase)]
        PostgreSQL[(PostgreSQL)]
        Storage[Supabase Storage<br/>Documents]
    end

    Browser --> Vercel
    Mobile --> Vercel
    Vercel --> React
    React -->|HTTPS REST| Express
    Express --> Auth
    Auth --> RBAC
    RBAC --> PostgreSQL
    Express --> Storage
    Supabase --> PostgreSQL
    Supabase --> Storage
```

### 2.5 Architectural Patterns

- **Monolith Modulaire:** Backend organisé en modules (auth, documents, projects, dashboard) - _Rationale:_ Simplicité pour MVP, un seul déploiement, facile à maintenir par un développeur solo

- **REST API:** Endpoints RESTful avec JSON - _Rationale:_ Standard, bien compris, compatible avec tous les clients, debugging facile

- **Repository Pattern:** Couche d'abstraction Prisma entre services et DB - _Rationale:_ Testabilité, possibilité de changer de DB sans refonte

- **Component-Based UI:** Composants React réutilisables avec TypeScript - _Rationale:_ Maintenabilité, type safety, écosystème shadcn/ui

- **JWT Authentication:** Access + Refresh tokens - _Rationale:_ Stateless, scalable, standard industrie

- **RBAC (Role-Based Access Control):** 4 niveaux de permissions - _Rationale:_ Requis par PRD, sécurité granulaire documents sensibles

---

## 3. Tech Stack

Cette table est la **source de vérité définitive** pour toutes les technologies du projet. Tout développement doit utiliser exactement ces versions.

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.3+ | Type safety frontend | Cohérence avec backend, moins de bugs runtime |
| **Frontend Framework** | React | 18.2+ | UI library | Maîtrisé par Adoum, écosystème riche |
| **UI Component Library** | shadcn/ui + Tailwind CSS | Latest | Composants UI | Accessible, customizable, pas de vendor lock-in |
| **State Management** | TanStack Query + Zustand | v5 / v4 | Server state + Client state | Query pour API caching, Zustand pour UI state minimal |
| **Routing** | React Router | 6.x | Navigation SPA | Standard, bien documenté |
| **Forms** | React Hook Form + Zod | 7.x / 3.x | Formulaires + validation | Performance, validation partagée frontend/backend |
| **Backend Language** | TypeScript | 5.3+ | Type safety backend | Partage types avec frontend |
| **Backend Framework** | Express.js | 4.x | API REST | Simple, rapide, maîtrisé |
| **API Style** | REST | OpenAPI 3.0 | Communication client-serveur | Standard, debugging facile, bien outillé |
| **ORM** | Prisma | 5.x | Database access | Type-safe, migrations, excellent DX |
| **Database** | PostgreSQL | 15+ (Supabase) | Data storage | Robuste, ACID, fonctionnalités avancées |
| **Cache** | Node memory (MVP) | - | API response cache | Simple pour MVP, Redis post-MVP |
| **File Storage** | Supabase Storage | - | Documents GED | S3-compatible, intégré, 1GB gratuit |
| **Authentication** | JWT + bcrypt | - | Auth tokens + password hash | Stateless, sécurisé, standard |
| **Frontend Testing** | Vitest + Testing Library | 1.x / 14.x | Unit & component tests | Rapide, compatible Vite |
| **Backend Testing** | Jest + Supertest | 29.x / 6.x | Unit & integration tests | Standard Node.js, mocking facile |
| **E2E Testing** | Playwright | 1.x | End-to-end (Phase 2) | Cross-browser, fiable |
| **Build Tool** | Vite | 5.x | Frontend bundling | Rapide, HMR excellent |
| **Bundler** | esbuild (via Vite) | - | JS bundling | Performance build |
| **Backend Build** | tsx + tsup | - | TS compilation | Dev rapide, build optimisé |
| **IaC Tool** | N/A (MVP) | - | Infrastructure | Déploiement manuel MVP, Terraform post-MVP |
| **CI/CD** | GitHub Actions | - | Automation | Gratuit 2000 min/mois, intégré |
| **Monitoring** | Vercel Analytics + Railway Logs | - | Performance & logs | Inclus gratuitement |
| **Logging** | Pino | 8.x | Structured logging | JSON logs, performant |
| **CSS Framework** | Tailwind CSS | 3.4+ | Styling | Utility-first, productivité |
| **Code Quality** | ESLint + Prettier | 8.x / 3.x | Linting & formatting | Standards cohérents |
| **Git Hooks** | Husky + lint-staged | 9.x / 15.x | Pre-commit checks | Qualité avant commit |

### Versions Node.js & Package Manager

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20 LTS | Support long terme, dernières features |
| **pnpm** | 8.x | Workspace support, rapide, économe disque |

---

## 4. Data Models

Définition des entités métier principales partagées entre frontend et backend.

### 4.1 User

**Purpose:** Représente un utilisateur de la plateforme avec son niveau d'accès.

**Key Attributes:**
- `id`: string (UUID) - Identifiant unique
- `email`: string - Email unique, utilisé pour login
- `passwordHash`: string - Hash bcrypt du mot de passe
- `firstName`: string - Prénom
- `lastName`: string - Nom
- `role`: Role - Niveau d'accès (SUPER_ADMIN, STAFF, CONTRIBUTOR, GUEST)
- `isActive`: boolean - Compte actif ou désactivé
- `createdAt`: DateTime - Date de création
- `updatedAt`: DateTime - Dernière modification

```typescript
// packages/shared/src/types/user.ts

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF = 'STAFF',
  CONTRIBUTOR = 'CONTRIBUTOR',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Version sans données sensibles pour le frontend
export type UserPublic = Omit<User, 'passwordHash'>;
```

**Relationships:**
- Un User peut créer plusieurs Folders
- Un User peut uploader plusieurs Documents
- Un User peut être membre de plusieurs Projects

### 4.2 Folder

**Purpose:** Dossier pour organiser les documents en hiérarchie.

```typescript
// packages/shared/src/types/folder.ts

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderWithChildren extends Folder {
  children: Folder[];
  documents: Document[];
  permissions: FolderPermission[];
}

export interface FolderTreeNode {
  id: string;
  name: string;
  children: FolderTreeNode[];
  hasAccess: boolean;
}
```

**Relationships:**
- Un Folder peut avoir un parent Folder (auto-référence)
- Un Folder peut contenir plusieurs Documents
- Un Folder a plusieurs FolderPermissions

### 4.3 FolderPermission

**Purpose:** Définit les droits d'accès par rôle sur un dossier.

```typescript
// packages/shared/src/types/permission.ts

export enum Permission {
  READ = 'READ',     // Voir et télécharger
  WRITE = 'WRITE',   // READ + upload, modifier, supprimer
  ADMIN = 'ADMIN'    // WRITE + gérer permissions
}

export interface FolderPermission {
  id: string;
  folderId: string;
  role: Role;
  permission: Permission;
}

// Helper pour vérifier les permissions
export const hasPermission = (
  userRole: Role,
  required: Permission,
  folderPermissions: FolderPermission[]
): boolean => {
  // SUPER_ADMIN a toujours accès
  if (userRole === Role.SUPER_ADMIN) return true;

  const userPerm = folderPermissions.find(p => p.role === userRole);
  if (!userPerm) return false;

  const levels = { READ: 1, WRITE: 2, ADMIN: 3 };
  return levels[userPerm.permission] >= levels[required];
};
```

### 4.4 Document

**Purpose:** Fichier uploadé dans la GED.

```typescript
// packages/shared/src/types/document.ts

export interface Document {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storagePath: string;
  folderId: string;
  currentVersionId: string | null;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWithDetails extends Document {
  folder: Folder;
  uploadedBy: UserPublic;
  versions: DocumentVersion[];
  currentVersion: DocumentVersion | null;
}

// Types MIME acceptés
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain'
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
```

### 4.5 DocumentVersion

**Purpose:** Historique des versions d'un document.

```typescript
export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  storagePath: string;
  size: number;
  uploadedById: string;
  createdAt: Date;
}
```

### 4.6 ShareLink

**Purpose:** Lien de partage temporaire pour accès externe.

```typescript
// packages/shared/src/types/share.ts

export interface ShareLink {
  id: string;
  documentId: string;
  token: string;
  expiresAt: Date;
  createdById: string;
  accessCount: number;
  createdAt: Date;
}

export type ShareDuration = '1h' | '24h' | '7d' | '30d';
```

### 4.7 AccessLog

**Purpose:** Journal d'audit des accès aux documents.

```typescript
// packages/shared/src/types/audit.ts

export enum AccessAction {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  SHARE = 'SHARE'
}

export interface AccessLog {
  id: string;
  documentId: string;
  userId: string | null;  // null pour accès via ShareLink
  action: AccessAction;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### 4.8 Project

**Purpose:** Projet de l'ONG avec suivi d'avancement.

```typescript
// packages/shared/src/types/project.ts

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PREPARATION = 'PREPARATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  createdById: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithDetails extends Project {
  members: ProjectMemberWithUser[];
  documents: DocumentWithDetails[];
  createdBy: UserPublic;
}
```

### 4.9 ProjectMember

**Purpose:** Association utilisateur-projet avec rôle projet.

```typescript
export enum ProjectRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER',
  VOLUNTEER = 'VOLUNTEER'
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  assignedAt: Date;
}

export interface ProjectMemberWithUser extends ProjectMember {
  user: UserPublic;
}
```

### 4.10 ProjectDocument

**Purpose:** Liaison entre projets et documents GED.

```typescript
export interface ProjectDocument {
  id: string;
  projectId: string;
  documentId: string;
  linkedById: string;
  linkedAt: Date;
}
```

### 4.11 Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ refresh_tokens : has
    users ||--o{ folders : creates
    users ||--o{ documents : uploads
    users ||--o{ document_versions : uploads
    users ||--o{ projects : creates
    users ||--o{ project_members : "is member"
    users ||--o{ share_links : creates
    users ||--o{ access_logs : generates
    users ||--o{ project_documents : links

    folders ||--o{ folders : contains
    folders ||--o{ documents : contains
    folders ||--o{ folder_permissions : has

    documents ||--o{ document_versions : has
    documents ||--o| document_versions : "current version"
    documents ||--o{ share_links : has
    documents ||--o{ access_logs : logs
    documents ||--o{ project_documents : linked

    projects ||--o{ project_members : has
    projects ||--o{ project_documents : has

    users {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    folders {
        uuid id PK
        string name
        uuid parent_id FK
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    folder_permissions {
        uuid id PK
        uuid folder_id FK
        enum role
        enum permission
        timestamp created_at
    }

    documents {
        uuid id PK
        string name
        string mime_type
        int size
        string storage_path
        uuid folder_id FK
        uuid current_version_id FK
        uuid uploaded_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    document_versions {
        uuid id PK
        uuid document_id FK
        int version_number
        string storage_path
        int size
        uuid uploaded_by_id FK
        timestamp created_at
    }

    projects {
        uuid id PK
        string name
        text description
        enum status
        date start_date
        date end_date
        decimal budget
        uuid created_by_id FK
        boolean is_archived
        timestamp created_at
        timestamp updated_at
    }
```

---

## 5. API Specification

API REST suivant la spécification OpenAPI 3.0. Base URL: `/api`

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/auth/register` | Créer un compte | ❌ | - |
| POST | `/auth/login` | Connexion | ❌ | - |
| POST | `/auth/refresh` | Renouveler token | ❌ | - |
| POST | `/auth/logout` | Déconnexion | ✅ | All |
| GET | `/auth/me` | Profil utilisateur connecté | ✅ | All |

**Request/Response Examples:**

```yaml
# POST /auth/login
Request:
  {
    "email": "user@example.com",
    "password": "Password123!"
  }

Response 200:
  {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF"
    }
  }

Response 401:
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Invalid credentials",
      "timestamp": "2026-01-20T10:00:00Z",
      "requestId": "req_abc123"
    }
  }
```

### 5.2 User Management Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/users` | Liste tous les utilisateurs | ✅ | SUPER_ADMIN |
| GET | `/users/:id` | Détail d'un utilisateur | ✅ | SUPER_ADMIN |
| POST | `/users` | Créer un utilisateur | ✅ | SUPER_ADMIN |
| PATCH | `/users/:id` | Modifier un utilisateur | ✅ | SUPER_ADMIN |
| DELETE | `/users/:id` | Désactiver un utilisateur | ✅ | SUPER_ADMIN |

**Query Parameters for GET /users:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 20) - Items per page
- `role` (enum) - Filter by role
- `isActive` (boolean) - Filter by status

### 5.3 Folder Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/folders` | Dossiers racine | ✅ | All |
| GET | `/folders/:id` | Détail d'un dossier | ✅ | All (avec permission) |
| GET | `/folders/:id/children` | Sous-dossiers | ✅ | All (avec permission) |
| POST | `/folders` | Créer un dossier | ✅ | STAFF+ |
| PATCH | `/folders/:id` | Modifier/déplacer | ✅ | STAFF+ |
| DELETE | `/folders/:id` | Supprimer (si vide) | ✅ | STAFF+ |
| GET | `/folders/:id/permissions` | Permissions du dossier | ✅ | STAFF+ |
| POST | `/folders/:id/permissions` | Ajouter permission | ✅ | SUPER_ADMIN, STAFF |
| DELETE | `/folders/:id/permissions/:permId` | Supprimer permission | ✅ | SUPER_ADMIN, STAFF |

### 5.4 Document Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/documents/upload` | Upload document | ✅ | WRITE permission |
| GET | `/documents/:id` | Métadonnées document | ✅ | READ permission |
| GET | `/documents/:id/download` | URL de téléchargement | ✅ | READ permission |
| PATCH | `/documents/:id` | Modifier/déplacer | ✅ | WRITE permission |
| DELETE | `/documents/:id` | Supprimer | ✅ | WRITE permission |
| GET | `/documents/search` | Recherche | ✅ | All (filtrée) |
| GET | `/folders/:id/documents` | Documents d'un dossier | ✅ | READ permission |
| POST | `/documents/:id/versions` | Nouvelle version | ✅ | WRITE permission |
| GET | `/documents/:id/versions` | Liste versions | ✅ | READ permission |
| POST | `/documents/:id/share` | Créer lien partage | ✅ | STAFF+ |
| GET | `/documents/:id/access-logs` | Logs d'accès | ✅ | SUPER_ADMIN |
| GET | `/share/:token` | Télécharger via lien | ❌ | - |

**Search Query Parameters:**
- `q` (string, required) - Search term
- `type` (string) - Filter by MIME type (pdf,docx,xlsx)
- `folderId` (uuid) - Limit to folder
- `recursive` (boolean) - Include subfolders
- `from` (date) - Date range start
- `to` (date) - Date range end
- `page` (int) - Page number
- `limit` (int) - Items per page

### 5.5 Project Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/projects` | Liste des projets | ✅ | All |
| GET | `/projects/:id` | Détail projet | ✅ | All |
| POST | `/projects` | Créer projet | ✅ | STAFF+ |
| PATCH | `/projects/:id` | Modifier projet | ✅ | STAFF+ |
| DELETE | `/projects/:id` | Archiver projet | ✅ | SUPER_ADMIN |
| GET | `/projects/:id/members` | Membres du projet | ✅ | All |
| POST | `/projects/:id/members` | Ajouter membre | ✅ | STAFF+ |
| PATCH | `/projects/:id/members/:memberId` | Modifier rôle | ✅ | STAFF+ |
| DELETE | `/projects/:id/members/:memberId` | Retirer membre | ✅ | STAFF+ |
| GET | `/projects/:id/documents` | Documents liés | ✅ | All |
| POST | `/projects/:id/documents` | Lier document | ✅ | STAFF+ |
| DELETE | `/projects/:id/documents/:docId` | Délier document | ✅ | STAFF+ |

### 5.6 Dashboard & Search Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/dashboard` | Données agrégées | ✅ | All |
| GET | `/dashboard/activity` | Activité récente | ✅ | All |
| GET | `/search` | Recherche globale | ✅ | All |
| GET | `/health` | Health check | ❌ | - |

**Dashboard Response:**
```json
{
  "projects": {
    "total": 15,
    "byStatus": {
      "draft": 2,
      "preparation": 3,
      "inProgress": 8,
      "completed": 2
    }
  },
  "myProjects": [...],
  "recentDocuments": [...],
  "upcomingDeadlines": [...],
  "stats": {
    "totalDocuments": 156,
    "totalProjects": 15,
    "totalUsers": 12
  }
}
```

---

## 6. Components

### 6.1 Backend Components

#### Auth Module
- **Responsibility:** Gestion de l'authentification et des tokens JWT
- **Key Interfaces:**
  - `AuthService.register(data)` → User
  - `AuthService.login(email, password)` → { accessToken, refreshToken, user }
  - `AuthService.refresh(refreshToken)` → { accessToken }
  - `AuthService.validateToken(token)` → TokenPayload
- **Dependencies:** UserRepository, bcrypt, jsonwebtoken

#### User Module
- **Responsibility:** CRUD utilisateurs et gestion des rôles
- **Key Interfaces:**
  - `UserService.findAll(filters, pagination)` → PaginatedUsers
  - `UserService.findById(id)` → User
  - `UserService.create(data)` → User
  - `UserService.update(id, data)` → User
  - `UserService.deactivate(id)` → void

#### Folder Module
- **Responsibility:** Gestion de l'arborescence des dossiers et permissions
- **Key Interfaces:**
  - `FolderService.getRootFolders(userId)` → Folder[]
  - `FolderService.getById(id, userId)` → FolderWithChildren
  - `FolderService.create(data, userId)` → Folder
  - `PermissionService.canAccess(userId, folderId, permission)` → boolean

#### Document Module
- **Responsibility:** Upload, stockage, versioning et partage des documents
- **Key Interfaces:**
  - `DocumentService.upload(file, folderId, userId)` → Document
  - `DocumentService.getById(id)` → DocumentWithDetails
  - `DocumentService.getDownloadUrl(id)` → string (signed URL)
  - `DocumentService.search(query, filters, userId)` → PaginatedDocuments
  - `ShareService.createLink(documentId, duration, userId)` → ShareLink

#### Project Module
- **Responsibility:** Gestion des projets, équipes et liaison documents
- **Key Interfaces:**
  - `ProjectService.findAll(filters, pagination)` → PaginatedProjects
  - `ProjectService.findById(id)` → ProjectWithDetails
  - `ProjectService.create(data, userId)` → Project
  - `MemberService.addMember(projectId, userId, role)` → ProjectMember

#### Dashboard Module
- **Responsibility:** Agrégation des données pour le tableau de bord
- **Key Interfaces:**
  - `DashboardService.getAggregatedData(userId)` → DashboardData
  - `DashboardService.getRecentActivity(userId, limit)` → ActivityItem[]

### 6.2 Frontend Components

#### Auth Components
- `<LoginPage />` - Formulaire de connexion
- `<ProtectedRoute />` - HOC pour routes authentifiées
- `useAuth()` - Hook pour état auth (user, login, logout)

#### Layout Components
- `<AppLayout />` - Layout principal avec sidebar/navbar
- `<Sidebar />` - Navigation latérale
- `<Navbar />` - Barre supérieure avec user menu
- `<Breadcrumb />` - Fil d'Ariane

#### Dashboard Components
- `<DashboardPage />` - Page principale
- `<ProjectsWidget />` - Mes projets récents
- `<DocumentsWidget />` - Documents récents
- `<DeadlinesWidget />` - Échéances proches

#### GED Components
- `<DocumentsPage />` - Page principale GED
- `<FolderTree />` - Arborescence dossiers (sidebar)
- `<DocumentList />` - Liste documents du dossier actif
- `<DocumentDetails />` - Drawer détails document
- `<UploadDropzone />` - Zone d'upload drag & drop
- `<ShareDialog />` - Modal de partage

#### Project Components
- `<ProjectsPage />` - Liste des projets
- `<ProjectCard />` - Card projet pour liste
- `<ProjectDetailPage />` - Page détail projet
- `<ProjectForm />` - Formulaire création/édition
- `<TeamManager />` - Gestion équipe projet

#### Admin Components
- `<UsersPage />` - Liste des utilisateurs
- `<UserTable />` - Tableau utilisateurs avec actions
- `<UserFormDialog />` - Modal création/édition utilisateur

#### Shared UI Components
- `<GlobalSearch />` - Barre de recherche globale
- `<LoadingSkeleton />` - Placeholder chargement
- `<EmptyState />` - État vide avec CTA
- `<ConfirmDialog />` - Confirmation actions destructives
- `<StatusBadge />` - Badge coloré pour statuts

### 6.3 Component Diagram

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

## 7. External APIs

### 7.1 Supabase Storage API

- **Purpose:** Stockage des documents GED (fichiers PDF, Word, Excel, images)
- **Documentation:** https://supabase.com/docs/guides/storage
- **Base URL:** `https://<project-ref>.supabase.co/storage/v1`
- **Authentication:** API Key (service role pour backend) + JWT user pour signed URLs
- **Rate Limits:** Tier gratuit: 1GB storage, 2GB bandwidth/mois

**Key Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/object/{bucket}/{path}` | Upload fichier |
| GET | `/object/{bucket}/{path}` | Télécharger fichier |
| DELETE | `/object/{bucket}/{path}` | Supprimer fichier |
| POST | `/object/sign/{bucket}/{path}` | Générer URL signée |

**Integration Code:**
```typescript
// apps/api/src/lib/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const storage = {
  async upload(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: false });
    if (error) throw error;
    return data;
  },

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  async delete(bucket: string, paths: string[]) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  }
};
```

### 7.2 Supabase PostgreSQL

- **Purpose:** Base de données principale
- **Connection:** Via Prisma ORM (pas Supabase JS client pour DB)
- **Limits:** Tier gratuit: 500MB storage, 60 connexions (pooler)

### 7.3 Environment Variables

```bash
# apps/api/.env

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # Service role key (NEVER expose)
SUPABASE_ANON_KEY=eyJ...

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.<ref>.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.<ref>.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-other-256-bit-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://app.ong-chadia.org
```

```bash
# apps/web/.env.local

VITE_API_URL=https://api.ong-chadia.org/api
VITE_APP_NAME="ONG Chadia Platform"
```

---

## 8. Core Workflows

### 8.1 Authentication Flow (Login)

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend (React)
    participant A as API (Express)
    participant DB as PostgreSQL

    U->>F: Saisie email/password
    F->>F: Validation Zod (format)
    F->>A: POST /api/auth/login
    A->>A: Validate input (Zod)
    A->>DB: SELECT user WHERE email

    alt User not found
        A-->>F: 401 Invalid credentials
        F-->>U: Afficher erreur
    else User found
        A->>A: bcrypt.compare(password, hash)
        alt Password invalid
            A-->>F: 401 Invalid credentials
        else Password valid
            A->>A: Generate JWT access token (15min)
            A->>A: Generate refresh token (7d)
            A->>DB: Store refresh token hash
            A-->>F: 200 { accessToken, refreshToken, user }
            F->>F: Store tokens
            F->>F: Update auth store (Zustand)
            F-->>U: Redirect to /dashboard
        end
    end
```

### 8.2 Token Refresh Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL

    Note over F: Access token expired (15min)
    F->>A: POST /api/auth/refresh { refreshToken }
    A->>A: Verify refresh token signature

    alt Token invalid/expired
        A-->>F: 401 Invalid refresh token
        F->>F: Clear auth store
        F-->>F: Redirect to /login
    else Token valid
        A->>DB: Check token not revoked
        A->>A: Generate new access token
        A-->>F: 200 { accessToken }
        F->>F: Update stored token
        F->>F: Retry original request
    end
```

### 8.3 Document Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL
    participant S as Supabase Storage

    U->>F: Drop file in upload zone
    F->>F: Validate file (size ≤50MB, type)
    F->>F: Show upload progress
    F->>A: POST /api/documents/upload (multipart)

    A->>A: Auth middleware (verify JWT)
    A->>DB: Get folder permissions
    A->>A: Check WRITE permission

    alt No permission
        A-->>F: 403 Forbidden
    else Has permission
        A->>A: Validate MIME type (server-side)
        A->>A: Generate unique path
        A->>S: Upload file to bucket
        A->>DB: INSERT Document record
        A->>DB: INSERT AccessLog (UPLOAD)
        A-->>F: 201 { document, signedUrl }
        F->>F: Update document list
        F-->>U: Success toast
    end
```

### 8.4 Folder Permission Inheritance

```mermaid
sequenceDiagram
    participant A as API
    participant DB as PostgreSQL

    Note over A: Check permission for folder F3
    Note over A: Hierarchy: Root → F1 → F2 → F3

    A->>DB: Get F3 permissions

    alt F3 has explicit permission for role
        A-->>A: Return F3 permission
    else No explicit permission
        A->>DB: Get parent F2 permissions

        alt F2 has explicit permission
            A-->>A: Return F2 permission (inherited)
        else No explicit permission
            A->>DB: Get parent F1 permissions
            A-->>A: Return F1 permission or NO ACCESS
        end
    end
```

### 8.5 Document Search Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL

    U->>F: Type in search bar (debounced 300ms)
    F->>A: GET /api/documents/search?q=rapport

    A->>A: Auth middleware
    A->>DB: Get all folders user can access
    A->>DB: SELECT documents WHERE name ILIKE AND folderId IN (accessible)
    A->>A: Apply pagination
    A-->>F: 200 { data, pagination }
    F-->>U: Show matching documents
```

---

## 9. Database Schema

### 9.1 Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// ENUMS
// ============================================

enum Role {
  SUPER_ADMIN
  STAFF
  CONTRIBUTOR
  GUEST
}

enum Permission {
  READ
  WRITE
  ADMIN
}

enum ProjectStatus {
  DRAFT
  PREPARATION
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ProjectRole {
  PROJECT_MANAGER
  MEMBER
  VOLUNTEER
}

enum AccessAction {
  VIEW
  DOWNLOAD
  UPLOAD
  EDIT
  DELETE
  SHARE
}

// ============================================
// USER & AUTH
// ============================================

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  firstName    String   @map("first_name")
  lastName     String   @map("last_name")
  role         Role     @default(GUEST)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  refreshTokens    RefreshToken[]
  createdFolders   Folder[]          @relation("FolderCreator")
  uploadedDocs     Document[]        @relation("DocumentUploader")
  uploadedVersions DocumentVersion[] @relation("VersionUploader")
  createdProjects  Project[]         @relation("ProjectCreator")
  projectMembers   ProjectMember[]
  shareLinks       ShareLink[]
  accessLogs       AccessLog[]
  linkedDocs       ProjectDocument[] @relation("DocumentLinker")

  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid())
  tokenHash String    @unique @map("token_hash")
  userId    String    @map("user_id")
  expiresAt DateTime  @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
  revokedAt DateTime? @map("revoked_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// ============================================
// GED - FOLDERS
// ============================================

model Folder {
  id          String   @id @default(uuid())
  name        String
  parentId    String?  @map("parent_id")
  createdById String   @map("created_by_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  parent      Folder?            @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Folder[]           @relation("FolderHierarchy")
  createdBy   User               @relation("FolderCreator", fields: [createdById], references: [id])
  documents   Document[]
  permissions FolderPermission[]

  @@unique([parentId, name])
  @@index([parentId])
  @@index([createdById])
  @@map("folders")
}

model FolderPermission {
  id         String     @id @default(uuid())
  folderId   String     @map("folder_id")
  role       Role
  permission Permission
  createdAt  DateTime   @default(now()) @map("created_at")

  folder Folder @relation(fields: [folderId], references: [id], onDelete: Cascade)

  @@unique([folderId, role])
  @@index([folderId])
  @@map("folder_permissions")
}

// ============================================
// GED - DOCUMENTS
// ============================================

model Document {
  id               String   @id @default(uuid())
  name             String
  mimeType         String   @map("mime_type")
  size             Int
  storagePath      String   @map("storage_path")
  folderId         String   @map("folder_id")
  currentVersionId String?  @unique @map("current_version_id")
  uploadedById     String   @map("uploaded_by_id")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // Relations
  folder         Folder            @relation(fields: [folderId], references: [id], onDelete: Cascade)
  uploadedBy     User              @relation("DocumentUploader", fields: [uploadedById], references: [id])
  currentVersion DocumentVersion?  @relation("CurrentVersion", fields: [currentVersionId], references: [id])
  versions       DocumentVersion[] @relation("DocumentVersions")
  shareLinks     ShareLink[]
  accessLogs     AccessLog[]
  projectDocs    ProjectDocument[]

  @@index([folderId])
  @@index([uploadedById])
  @@index([name])
  @@index([createdAt])
  @@map("documents")
}

model DocumentVersion {
  id            String   @id @default(uuid())
  documentId    String   @map("document_id")
  versionNumber Int      @map("version_number")
  storagePath   String   @map("storage_path")
  size          Int
  uploadedById  String   @map("uploaded_by_id")
  createdAt     DateTime @default(now()) @map("created_at")

  // Relations
  document          Document  @relation("DocumentVersions", fields: [documentId], references: [id], onDelete: Cascade)
  uploadedBy        User      @relation("VersionUploader", fields: [uploadedById], references: [id])
  currentOfDocument Document? @relation("CurrentVersion")

  @@unique([documentId, versionNumber])
  @@index([documentId])
  @@map("document_versions")
}

model ShareLink {
  id          String   @id @default(uuid())
  documentId  String   @map("document_id")
  token       String   @unique
  expiresAt   DateTime @map("expires_at")
  createdById String   @map("created_by_id")
  accessCount Int      @default(0) @map("access_count")
  createdAt   DateTime @default(now()) @map("created_at")

  document  Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdBy User     @relation(fields: [createdById], references: [id])

  @@index([documentId])
  @@index([token])
  @@index([expiresAt])
  @@map("share_links")
}

model AccessLog {
  id         String       @id @default(uuid())
  documentId String       @map("document_id")
  userId     String?      @map("user_id")
  action     AccessAction
  ipAddress  String?      @map("ip_address")
  userAgent  String?      @map("user_agent")
  createdAt  DateTime     @default(now()) @map("created_at")

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user     User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([documentId])
  @@index([userId])
  @@index([createdAt])
  @@map("access_logs")
}

// ============================================
// PROJECTS
// ============================================

model Project {
  id          String        @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(DRAFT)
  startDate   DateTime?     @map("start_date")
  endDate     DateTime?     @map("end_date")
  budget      Decimal?      @db.Decimal(12, 2)
  createdById String        @map("created_by_id")
  isArchived  Boolean       @default(false) @map("is_archived")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  // Relations
  createdBy User              @relation("ProjectCreator", fields: [createdById], references: [id])
  members   ProjectMember[]
  documents ProjectDocument[]

  @@index([createdById])
  @@index([status])
  @@index([endDate])
  @@index([isArchived])
  @@map("projects")
}

model ProjectMember {
  id         String      @id @default(uuid())
  projectId  String      @map("project_id")
  userId     String      @map("user_id")
  role       ProjectRole @default(MEMBER)
  assignedAt DateTime    @default(now()) @map("assigned_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_members")
}

model ProjectDocument {
  id         String   @id @default(uuid())
  projectId  String   @map("project_id")
  documentId String   @map("document_id")
  linkedById String   @map("linked_by_id")
  linkedAt   DateTime @default(now()) @map("linked_at")

  project  Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  linkedBy User     @relation("DocumentLinker", fields: [linkedById], references: [id])

  @@unique([projectId, documentId])
  @@index([projectId])
  @@index([documentId])
  @@map("project_documents")
}
```

### 9.2 Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@ong-chadia.org' },
    update: {},
    create: {
      email: 'admin@ong-chadia.org',
      passwordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('Created Super Admin:', superAdmin.email);

  // Create default root folders
  const defaultFolders = [
    'Projets',
    'Administration',
    'Ressources Humaines',
    'Bailleurs',
    'Templates',
  ];

  for (const name of defaultFolders) {
    await prisma.folder.upsert({
      where: { parentId_name: { parentId: null, name } },
      update: {},
      create: {
        name,
        createdById: superAdmin.id,
      },
    });
  }

  console.log('Created default folders');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 10. Frontend Architecture

### 10.1 Component Organization

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

### 10.2 State Management

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

### 10.3 Routing Architecture

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

### 10.4 API Client Setup

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

## 11. Backend Architecture

### 11.1 Project Structure

```
apps/api/src/
├── index.ts                   # Entry point
├── app.ts                     # Express app setup
├── config/
│   ├── index.ts               # Config loader
│   ├── database.ts            # Prisma client
│   └── storage.ts             # Supabase storage
│
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.validators.ts
│   │
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.validators.ts
│   │
│   ├── folders/
│   │   ├── folders.routes.ts
│   │   ├── folders.controller.ts
│   │   ├── folders.service.ts
│   │   ├── folders.validators.ts
│   │   └── permissions.service.ts
│   │
│   ├── documents/
│   │   ├── documents.routes.ts
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── documents.validators.ts
│   │   ├── versions.service.ts
│   │   ├── share.service.ts
│   │   └── audit.service.ts
│   │
│   ├── projects/
│   │   ├── projects.routes.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── projects.validators.ts
│   │   ├── members.service.ts
│   │   └── project-documents.service.ts
│   │
│   └── dashboard/
│       ├── dashboard.routes.ts
│       ├── dashboard.controller.ts
│       └── dashboard.service.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   ├── validate.middleware.ts
│   ├── upload.middleware.ts
│   ├── rateLimiter.middleware.ts
│   └── errorHandler.middleware.ts
│
├── common/
│   ├── errors.ts
│   ├── responses.ts
│   ├── pagination.ts
│   └── logger.ts
│
└── utils/
    ├── jwt.ts
    ├── hash.ts
    └── storage.ts
```

### 11.2 Auth Middleware

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { prisma } from '@/config/database';
import { UnauthorizedError } from '@/common/errors';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

// middleware/rbac.middleware.ts
import { Role } from '@prisma/client';
import { ForbiddenError } from '@/common/errors';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

export const isSuperAdmin = authorize(Role.SUPER_ADMIN);
export const isStaffOrAbove = authorize(Role.SUPER_ADMIN, Role.STAFF);
```

### 11.3 Error Classes

```typescript
// common/errors.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code = 'BAD_REQUEST';
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}
```

---

## 12. Unified Project Structure

```
ong-chadia-platform/
├── .github/
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
│
├── apps/
│   ├── web/                           # Frontend React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── lib/
│   │   │   ├── styles/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── tests/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── .env.example
│   │
│   └── api/                           # Backend Express
│       ├── src/
│       │   ├── config/
│       │   ├── modules/
│       │   ├── middleware/
│       │   ├── common/
│       │   ├── utils/
│       │   ├── types/
│       │   ├── index.ts
│       │   └── app.ts
│       ├── tests/
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── packages/
│   └── shared/                        # Shared Types & Utilities
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   ├── validators/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   └── api.md
│
├── scripts/
│   ├── setup.sh
│   └── dev.sh
│
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### Root package.json

```json
{
  "name": "ong-chadia-platform",
  "private": true,
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "pnpm run --parallel build",
    "lint": "pnpm run --parallel lint",
    "test": "pnpm run --parallel test",
    "db:migrate": "pnpm --filter api prisma migrate dev",
    "db:push": "pnpm --filter api prisma db push",
    "db:seed": "pnpm --filter api prisma db seed",
    "db:studio": "pnpm --filter api prisma studio"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 13. Development Workflow

### 13.1 Local Setup

```bash
# 1. Clone and install
git clone https://github.com/ong-chadia/platform.git
cd platform
pnpm install

# 2. Configure environment
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 3. Setup database
pnpm db:push
pnpm db:seed

# 4. Start development
pnpm dev
```

### 13.2 Development Commands

```bash
# Start all services
pnpm dev                    # Frontend: localhost:5173, Backend: localhost:3001

# Individual services
pnpm dev:web               # Frontend only
pnpm dev:api               # Backend only

# Database
pnpm db:migrate            # Create migration
pnpm db:push               # Push schema (dev)
pnpm db:seed               # Seed data
pnpm db:studio             # Prisma Studio GUI

# Quality
pnpm lint                  # Lint all
pnpm test                  # Run tests
pnpm build                 # Build all
```

### 13.3 Git Workflow

```bash
# Branches
main        # Production
develop     # Integration
feature/*   # Features
fix/*       # Bug fixes

# Commit format (Conventional Commits)
feat(ged): add document upload
fix(auth): resolve token refresh
docs(api): update endpoint docs
refactor(api): extract permission logic
test(projects): add integration tests
chore(deps): update prisma
```

---

## 14. Deployment Architecture

### 14.1 Deployment Strategy

| Component | Platform | Method |
|-----------|----------|--------|
| Frontend | Vercel | Auto-deploy on push to main |
| Backend | Railway | Auto-deploy on push to main |
| Database | Supabase | Managed (migrations via CI) |

### 14.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### 14.3 Environments

| Environment | Frontend URL | Backend URL |
|-------------|--------------|-------------|
| Development | localhost:5173 | localhost:3001 |
| Production | app.ong-chadia.org | api.ong-chadia.org |

---

## 15. Security and Performance

### 15.1 Security Requirements

**Frontend Security:**
- CSP Headers configured
- XSS prevention (React escaping)
- Tokens in memory (not localStorage for sensitive)

**Backend Security:**
- Input validation (Zod on all endpoints)
- Rate limiting (5 req/15min on auth)
- CORS restrictif
- Helmet.js headers
- Passwords: bcrypt 12 rounds
- JWT: 15min access, 7d refresh

**Authentication Security:**
```typescript
// Password policy
const passwordSchema = z.string()
  .min(8, 'Min 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number');

// Bcrypt rounds
const BCRYPT_ROUNDS = 12;

// JWT expiry
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';
```

### 15.2 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| API Response (p95) | < 200ms |
| Document Search | < 1s |
| File Upload (10MB) | < 5s |

### 15.3 Performance Optimization

**Frontend:**
- Code splitting (lazy routes)
- TanStack Query caching (5min stale time)
- Image lazy loading

**Backend:**
- Database indexes on frequent queries
- Prisma select (only needed fields)
- Pagination everywhere
- Connection pooling (Supabase)

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
        E2E Tests (5-10)         ← Critical paths only (Phase 2)
       /              \
   Integration (30-50)           ← API endpoints
  /                    \
Unit Tests (100+)                ← Services, hooks, utils
```

### 16.2 Coverage Targets

| Module | Target |
|--------|--------|
| Auth Services | 80%+ |
| Permission Services | 80%+ |
| Document Services | 70%+ |
| Project Services | 60%+ |
| Frontend Hooks | 60%+ |

### 16.3 Test Examples

**Backend Unit Test:**
```typescript
// tests/unit/auth.service.test.ts
describe('AuthService', () => {
  it('hashes password with bcrypt', async () => {
    const hash = await authService.hashPassword('Password123!');
    expect(hash).not.toBe('Password123!');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('validates correct password', async () => {
    const hash = await authService.hashPassword('Password123!');
    const isValid = await authService.comparePassword('Password123!', hash);
    expect(isValid).toBe(true);
  });
});
```

**Backend Integration Test:**
```typescript
// tests/integration/auth.test.ts
describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    await createTestUser({ email: 'user@test.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('returns 401 for invalid password', async () => {
    await createTestUser({ email: 'user@test.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'WrongPassword!' });

    expect(response.status).toBe(401);
  });
});
```

---

## 17. Coding Standards

### 17.1 Critical Rules

1. **Types dans `packages/shared`** - Jamais dupliquer entre frontend/backend
2. **API calls via services** - Jamais `fetch` direct
3. **Environment via config** - Jamais `process.env` direct dans le code métier
4. **Toujours vérifier les permissions** avant opérations sur documents/dossiers
5. **Toujours paginer** les listes
6. **Jamais logger** les mots de passe ou tokens

### 17.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `DocumentCard.tsx` |
| Hooks | camelCase + use | `useDocuments.ts` |
| Services | camelCase.service | `documents.service.ts` |
| API Routes | kebab-case | `/folder-permissions` |
| DB Tables | snake_case | `folder_permissions` |
| Enums | UPPER_SNAKE | `PROJECT_MANAGER` |

### 17.3 Code Patterns

```typescript
// ✅ CORRECT - API response
res.json({ data: documents, pagination: { page, limit, total, totalPages } });

// ❌ WRONG
res.json(documents);

// ✅ CORRECT - Permission check
const canAccess = await permissionsService.canAccess(userId, folderId, Permission.READ);
if (!canAccess) throw new ForbiddenError();

// ❌ WRONG - No check
return prisma.document.findUnique({ where: { id } });

// ✅ CORRECT - Pagination
const docs = await prisma.document.findMany({ skip, take: limit });

// ❌ WRONG
const docs = await prisma.document.findMany();
```

---

## 18. Error Handling Strategy

### 18.1 Error Response Format

```typescript
interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId: string;
  };
}

type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';
```

### 18.2 Error Handler Middleware

```typescript
// middleware/errorHandler.middleware.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const requestId = uuid();

  logger.error({ requestId, error: err.message, stack: err.stack });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
}
```

---

## 19. Monitoring and Observability

### 19.1 Monitoring Stack

| Component | Tool |
|-----------|------|
| Frontend | Vercel Analytics |
| Backend | Railway Metrics + Logs |
| Uptime | UptimeRobot |
| Logging | Pino (JSON) |

### 19.2 Logging

```typescript
// common/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'req.body.password'],
});

// Usage
logger.info({ userId, documentId }, 'Document uploaded');
logger.error({ err, requestId }, 'Upload failed');
```

### 19.3 Health Check

```typescript
// GET /api/health
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy' });
  }
});
```

---

## 20. Checklist Results

### 20.1 Executive Summary

| Critère | Évaluation |
|---------|------------|
| **Architecture Readiness** | ✅ HIGH |
| **Type de Projet** | Full-stack |
| **Score Global** | 97% |
| **Prêt pour Développement** | ✅ OUI |

### 20.2 Section Analysis

| Section | Status |
|---------|--------|
| Requirements Alignment | ✅ PASS |
| Architecture Fundamentals | ✅ PASS |
| Technical Stack | ✅ PASS |
| Frontend Design | ✅ PASS |
| Backend Architecture | ✅ PASS |
| Security & Compliance | ✅ PASS |
| Testing Strategy | ✅ PASS |
| Deployment | ✅ PASS |
| AI Implementation Suitability | ✅ PASS |

### 20.3 Risks

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Limites tier gratuit | MOYEN | Monitoring, plan migration |
| Développeur solo | MOYEN | Architecture simple, docs |
| Complexité permissions | MOYEN | Tests exhaustifs |

### 20.4 Final Decision

**✅ ARCHITECTURE VALIDÉE - PRÊTE POUR DÉVELOPPEMENT**

---

## Next Steps

1. **Créer le repository** et structure monorepo
2. **Configurer Supabase** (projet, DB, Storage)
3. **Configurer Vercel** et **Railway**
4. **Implémenter Epic 1** - Foundation & Auth
5. **Utiliser `/dev`** pour le développement

---

_Document généré avec BMAD-METHOD_
_Architecture Version 1.0 - Finalisé le 2026-01-20_
