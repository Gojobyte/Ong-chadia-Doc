# Epic 1: Foundation & Authentification

## Objectif

Établir les fondations techniques du projet (monorepo, base de données, CI/CD) et implémenter un système d'authentification complet avec gestion des utilisateurs à 4 niveaux de rôles (Super-Admin, Staff, Contributeur, Invité). À la fin de cet epic, l'application sera déployée avec un système de login fonctionnel et une interface d'administration des utilisateurs.

## Story 1.1: Project Setup & Infrastructure

**As a** développeur,
**I want** initialiser le monorepo avec la structure frontend/backend et le déploiement automatique,
**so that** j'ai une base de code organisée et déployable dès le début du projet.

**Acceptance Criteria:**

1. Monorepo créé avec pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`)
2. Frontend React + Vite + TypeScript initialisé dans `apps/web`
3. Backend Express + TypeScript initialisé dans `apps/api`
4. Tailwind CSS + shadcn/ui configurés dans le frontend
5. ESLint + Prettier configurés avec règles partagées
6. Scripts `dev`, `build`, `lint` fonctionnels à la racine
7. README avec instructions de setup local
8. `.env.example` avec variables d'environnement documentées
9. Déploiement Vercel configuré pour frontend (auto-deploy sur push)
10. Déploiement Railway/Render configuré pour backend

---

## Story 1.2: Database Schema & Prisma Setup

**As a** développeur,
**I want** configurer Prisma avec le schéma de base de données initial,
**so that** j'ai une couche d'accès aux données type-safe et des migrations versionnées.

**Acceptance Criteria:**

1. Prisma initialisé et connecté à PostgreSQL (Supabase)
2. Schéma `User` créé avec champs : id, email, passwordHash, firstName, lastName, role, createdAt, updatedAt
3. Enum `Role` défini : SUPER_ADMIN, STAFF, CONTRIBUTOR, GUEST
4. Migration initiale créée et appliquée
5. Prisma Client généré et exporté depuis `packages/shared`
6. Script de seed créant un Super-Admin par défaut
7. Types Prisma partagés entre frontend et backend
8. Documentation du schéma dans README

---

## Story 1.3: Authentication API

**As a** utilisateur,
**I want** pouvoir m'inscrire et me connecter via API,
**so that** je puisse accéder de manière sécurisée à l'application.

**Acceptance Criteria:**

1. Endpoint `POST /api/auth/register` créant un utilisateur (email, password, firstName, lastName)
2. Endpoint `POST /api/auth/login` retournant JWT access token + refresh token
3. Endpoint `POST /api/auth/refresh` renouvelant l'access token
4. Endpoint `POST /api/auth/logout` invalidant le refresh token
5. Endpoint `GET /api/auth/me` retournant le profil utilisateur connecté
6. Mots de passe hashés avec bcrypt (12 rounds)
7. JWT access token expire en 15 minutes, refresh token en 7 jours
8. Validation des inputs avec Zod (email format, password min 8 chars)
9. Gestion d'erreurs appropriée (401, 400, 409 pour email existant)
10. Tests unitaires pour les services auth (≥80% coverage)

---

## Story 1.4: Auth Middleware & Role Guards

**As a** développeur,
**I want** des middlewares d'authentification et d'autorisation,
**so that** je puisse protéger les routes API selon les rôles utilisateurs.

**Acceptance Criteria:**

1. Middleware `authenticate` vérifiant le JWT et attachant `req.user`
2. Middleware `authorize(roles[])` vérifiant que l'utilisateur a un rôle autorisé
3. Guard `isSuperAdmin` pour routes admin uniquement
4. Guard `isStaffOrAbove` pour routes staff+
5. Gestion des tokens expirés (401 avec message clair)
6. Gestion des tokens invalides (401)
7. Gestion des rôles insuffisants (403)
8. Tests unitaires pour tous les middlewares
9. Documentation des guards disponibles

---

## Story 1.5: User Management API

**As a** Super-Admin,
**I want** gérer les utilisateurs via API (CRUD),
**so that** je puisse créer des comptes, modifier les rôles et désactiver des utilisateurs.

**Acceptance Criteria:**

1. Endpoint `GET /api/users` listant tous les utilisateurs (Super-Admin only)
2. Endpoint `GET /api/users/:id` récupérant un utilisateur
3. Endpoint `POST /api/users` créant un utilisateur avec rôle assigné
4. Endpoint `PATCH /api/users/:id` modifiant un utilisateur (nom, email, rôle)
5. Endpoint `DELETE /api/users/:id` désactivant un utilisateur (soft delete)
6. Filtrage par rôle sur GET /api/users (`?role=STAFF`)
7. Pagination sur GET /api/users (`?page=1&limit=20`)
8. Validation : impossible de supprimer son propre compte
9. Validation : impossible de modifier le rôle du dernier Super-Admin
10. Tests d'intégration pour tous les endpoints

---

## Story 1.6: Login & Auth UI

**As a** utilisateur,
**I want** une page de connexion et un système de routes protégées,
**so that** je puisse me connecter et accéder à l'application de manière sécurisée.

**Acceptance Criteria:**

1. Page `/login` avec formulaire email/password
2. Validation côté client (email format, password required)
3. Affichage des erreurs de connexion (credentials invalides)
4. Stockage sécurisé des tokens (httpOnly cookies ou secure storage)
5. Redirection vers dashboard après login réussi
6. Composant `ProtectedRoute` redirigeant vers login si non authentifié
7. Auto-refresh du token avant expiration
8. Bouton de déconnexion fonctionnel
9. État de chargement pendant l'authentification
10. Layout de base avec navbar (logo, user menu, logout)

---

## Story 1.7: User Management UI

**As a** Super-Admin,
**I want** une interface pour gérer les utilisateurs,
**so that** je puisse créer des comptes, modifier les rôles et voir tous les utilisateurs.

**Acceptance Criteria:**

1. Page `/admin/users` accessible uniquement aux Super-Admins
2. Tableau listant tous les utilisateurs (nom, email, rôle, date création)
3. Pagination du tableau
4. Filtres par rôle
5. Bouton "Ajouter utilisateur" ouvrant un modal/formulaire
6. Formulaire de création : email, prénom, nom, rôle, mot de passe temporaire
7. Action "Modifier" sur chaque ligne ouvrant un formulaire d'édition
8. Action "Désactiver" avec confirmation
9. Indicateur visuel pour utilisateurs désactivés
10. Messages de succès/erreur (toasts)

---
