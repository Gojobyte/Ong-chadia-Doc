# 5. API Specification

API REST suivant la spécification OpenAPI 3.0. Base URL: `/api`

## 5.1 Authentication Endpoints

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

## 5.2 User Management Endpoints

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

## 5.3 Folder Endpoints

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

## 5.4 Document Endpoints

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

## 5.5 Project Endpoints

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

## 5.6 Dashboard & Search Endpoints

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
