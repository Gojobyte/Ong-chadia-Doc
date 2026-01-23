# Plateforme de Gestion ONG Chadia - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-01-20
**Auteur:** John (PM Agent)
**Statut:** Finalisé - Prêt pour Architecture

---

## Table des Matières

1. [Goals and Background Context](#goals-and-background-context)
2. [Requirements](#requirements)
3. [User Interface Design Goals](#user-interface-design-goals)
4. [Technical Assumptions](#technical-assumptions)
5. [Epic List](#epic-list)
6. [Epic 1: Foundation & Authentification](#epic-1-foundation--authentification)
7. [Epic 2: GED - Gestion Documentaire](#epic-2-ged---gestion-électronique-de-documents)
8. [Epic 3: Gestion de Projets](#epic-3-gestion-de-projets)
9. [Epic 4: Dashboard & Intégration](#epic-4-dashboard--intégration)
10. [Checklist Results Report](#checklist-results-report)
11. [Next Steps](#next-steps)

---

## Goals and Background Context

### Goals

- **Réduire de 70% le temps de veille quotidienne** des appels d'offres grâce à l'agrégation et au filtrage automatiques
- **Accélérer de 60% la création de propositions** via un système de templates et blocs réutilisables
- **Centraliser 100% des documents sensibles** dans une GED sécurisée avec contrôle d'accès granulaire
- **Permettre le suivi intégré** de tous les projets, de la détection d'opportunité au reporting bailleur
- **Supporter l'expansion** de l'équipe (4-5 permanents + bénévoles) sans friction d'onboarding
- **Doubler la capacité de réponse** aux appels d'offres dans les 6 premiers mois

### Background Context

L'ONG Chadia opère au Tchad dans les secteurs WASH, formation et sécurité alimentaire. Actuellement, l'équipe permanente de 4-5 personnes passe plusieurs heures par jour à rechercher manuellement des appels d'offres sur de multiples sources (UNGM, UNHCR, WFP, UNICEF, ReliefWeb, etc.), les trier, évaluer leur pertinence, puis rédiger chaque proposition depuis zéro dans Word. Les documents sont dispersés entre emails, Google Drive et disques locaux, créant des risques de sécurité et une inefficacité opérationnelle.

Un nouveau projet financé démarre dans **1 mois**, créant une urgence pour disposer d'outils de gestion structurés. Le budget infrastructure est de **$0 pour le MVP** (utilisation de tiers gratuits : Vercel, Railway, Supabase), avec migration vers VPS prévue une fois des fonds disponibles.

### Change Log

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-20 | 1.0 | PRD complet avec 4 Epics et 32 Stories | John (PM) |

---

## Requirements

### Functional Requirements

#### Module Authentification & Utilisateurs

- **FR1:** Le système doit permettre la création de comptes utilisateurs avec 4 niveaux de rôles : Super-Admin, Staff, Contributeur, Invité
- **FR2:** Le système doit authentifier les utilisateurs via email/mot de passe avec tokens JWT sécurisés
- **FR3:** Les Super-Admins doivent pouvoir créer, modifier, désactiver et supprimer des comptes utilisateurs
- **FR4:** Les Super-Admins doivent pouvoir assigner et modifier les rôles des utilisateurs

#### Module GED (Gestion Électronique de Documents)

- **FR5:** Le système doit permettre l'upload de documents (PDF, Word, Excel, images) jusqu'à 50 MB
- **FR6:** Le système doit organiser les documents en dossiers/catégories hiérarchiques
- **FR7:** Le système doit appliquer les permissions d'accès par rôle sur chaque dossier/document
- **FR8:** Le système doit permettre la recherche de documents par nom, tags et métadonnées
- **FR9:** Le système doit conserver un historique des versions de chaque document
- **FR10:** Le système doit permettre le partage de documents via liens sécurisés (pour bailleurs/partenaires)
- **FR11:** Le système doit journaliser tous les accès aux documents sensibles

#### Module Gestion de Projets

- **FR12:** Le système doit permettre la création de fiches projet (nom, description, dates, budget, statut)
- **FR13:** Le système doit permettre l'assignation de membres d'équipe (permanents + bénévoles) aux projets
- **FR14:** Le système doit suivre l'avancement des projets par phases (Préparation, En cours, Terminé)
- **FR15:** Le système doit lier automatiquement les documents de la GED aux projets concernés
- **FR16:** Le système doit afficher un tableau de bord avec les projets actifs et leurs statuts

#### Module Veille Appels d'Offres (Phase 2 - Post Micro-MVP)

- **FR17:** Le système doit agréger les appels d'offres depuis des sources configurables (emails IMAP, flux RSS)
- **FR18:** Le système doit filtrer les appels d'offres par mots-clés sectoriels (WASH, formation, sécurité alimentaire)
- **FR19:** Le système doit afficher les appels d'offres avec indicateur de pertinence (Pertinent/Non pertinent/À examiner)
- **FR20:** Le système doit alerter par email sur les nouveaux appels d'offres pertinents

#### Module Templates & Propositions (Phase 2 - Post Micro-MVP)

- **FR21:** Le système doit permettre la création et gestion de templates réutilisables (présentation ONG, méthodologies, budgets)
- **FR22:** Le système doit permettre la composition de propositions en assemblant des blocs de templates
- **FR23:** Le système doit exporter les propositions en format Word et PDF
- **FR24:** Le système doit gérer les versions des templates

#### Module Budgets (Phase 2 - Post Micro-MVP)

- **FR25:** Le système doit fournir des templates de budgets avec lignes budgétaires standards
- **FR26:** Le système doit calculer automatiquement les totaux, sous-totaux et pourcentages
- **FR27:** Le système doit exporter les budgets en Excel et PDF

#### Dashboard Unifié

- **FR28:** Le système doit afficher un tableau de bord avec accès rapide aux projets, documents et (plus tard) appels d'offres
- **FR29:** Le système doit afficher des alertes sur les échéances approchantes

### Non-Functional Requirements

#### Performance

- **NFR1:** Le temps de chargement de chaque page doit être ≤ 3 secondes
- **NFR2:** La recherche dans la GED doit retourner des résultats en ≤ 1 seconde
- **NFR3:** Le système doit supporter 20+ utilisateurs simultanés (scalable au-delà)

#### Sécurité

- **NFR4:** Toutes les communications doivent être chiffrées via HTTPS/TLS
- **NFR5:** Les documents sensibles doivent être chiffrés at-rest (AES-256)
- **NFR6:** Les mots de passe doivent être hashés avec bcrypt ou Argon2
- **NFR7:** Le système doit implémenter RBAC (Role-Based Access Control) à 4 niveaux
- **NFR8:** Les tokens JWT doivent expirer après une durée configurable avec refresh tokens

#### Disponibilité & Fiabilité

- **NFR9:** Le système doit avoir un uptime ≥ 95% durant le MVP (≥ 99% post-MVP)
- **NFR10:** Les backups de la base de données doivent être effectués au minimum hebdomadairement (quotidiennement post-MVP)

#### Infrastructure & Coûts

- **NFR11:** L'infrastructure MVP doit utiliser exclusivement des tiers gratuits (Vercel, Railway/Render, Supabase)
- **NFR12:** L'architecture doit permettre une migration facile vers VPS sans refonte majeure
- **NFR13:** Le stockage documents doit rester sous 25 GB pour le MVP (limite tier gratuit)

#### Compatibilité

- **NFR14:** L'application doit être responsive et fonctionner sur navigateurs modernes (Chrome, Firefox, Safari, Edge - 2 dernières versions)
- **NFR15:** L'interface doit être utilisable sur tablettes et mobiles (pas d'app native pour MVP)

#### Conformité

- **NFR16:** Le système doit respecter les principes RGPD (données personnelles des bénéficiaires/staff)
- **NFR17:** Le système doit permettre l'export et la suppression des données personnelles sur demande

#### Maintenabilité

- **NFR18:** Le code doit inclure des tests unitaires pour les fonctionnalités critiques
- **NFR19:** La documentation technique doit être maintenue à jour

#### Langue

- **NFR20:** L'interface utilisateur doit être en français pour le MVP

---

## User Interface Design Goals

### Overall UX Vision

L'interface doit être **simple, fonctionnelle et professionnelle**, adaptée à une équipe avec des niveaux variés de compétence technologique (de basique à intermédiaire). L'accent est mis sur :

- **Efficacité** : Accès rapide aux actions fréquentes (upload document, créer projet, consulter dashboard)
- **Clarté** : Navigation intuitive sans formation complexe requise
- **Confiance** : Indicateurs clairs des niveaux d'accès et de la sécurité des documents
- **Productivité** : Réduction du nombre de clics pour accomplir les tâches courantes

L'expérience doit permettre à un nouveau membre (permanent ou bénévole) d'être opérationnel en **moins de 2 heures**.

### Key Interaction Paradigms

| Paradigme | Description |
|-----------|-------------|
| **Dashboard-centric** | Point d'entrée unique avec vue d'ensemble et accès rapide à toutes les fonctions |
| **Drag & Drop** | Upload de documents par glisser-déposer dans la GED |
| **Recherche omniprésente** | Barre de recherche globale accessible depuis toute page |
| **Actions contextuelles** | Menus d'actions sur les éléments (documents, projets) via clic droit ou bouton "..." |
| **Breadcrumbs** | Navigation par fil d'Ariane dans la GED pour la hiérarchie des dossiers |
| **Notifications inline** | Alertes et confirmations non-bloquantes (toasts) |
| **Formulaires progressifs** | Création de projets/documents en étapes simples avec sauvegarde automatique |

### Core Screens and Views

#### Écrans Principaux (Micro-MVP)

| # | Écran | Description | Priorité |
|---|-------|-------------|----------|
| 1 | **Login / Inscription** | Authentification sécurisée | P0 |
| 2 | **Dashboard Principal** | Vue d'ensemble : projets actifs, documents récents, alertes | P0 |
| 3 | **GED - Explorateur de Documents** | Navigation dossiers, liste documents, upload, recherche | P0 |
| 4 | **GED - Détail Document** | Prévisualisation, métadonnées, historique versions, partage | P0 |
| 5 | **Projets - Liste** | Tous les projets avec filtres (statut, date) | P0 |
| 6 | **Projet - Détail** | Fiche projet, équipe assignée, documents liés, avancement | P0 |
| 7 | **Projet - Création/Édition** | Formulaire de création et modification | P0 |
| 8 | **Administration - Utilisateurs** | Gestion des comptes et rôles (Super-Admin uniquement) | P0 |
| 9 | **Profil Utilisateur** | Paramètres personnels, mot de passe | P1 |

#### Écrans Phase 2

| # | Écran | Description | Phase |
|---|-------|-------------|-------|
| 10 | Veille - Liste Appels d'Offres | Appels d'offres agrégés avec filtres | Phase 2 |
| 11 | Veille - Détail Appel d'Offre | Informations complètes, actions | Phase 2 |
| 12 | Templates - Bibliothèque | Liste et gestion des templates | Phase 2 |
| 13 | Propositions - Éditeur | Composition de propositions | Phase 2 |
| 14 | Budgets - Éditeur | Création et gestion budgets | Phase 2 |

### Accessibility

**Niveau : WCAG AA (Standard)**

- Contraste de couleurs suffisant (ratio 4.5:1 minimum)
- Navigation au clavier possible
- Labels sur tous les champs de formulaire
- Messages d'erreur clairs et descriptifs
- Textes alternatifs sur les images fonctionnelles

### Branding

**Proposition de direction visuelle :**

- **Couleurs** : Palette professionnelle et sobre (bleus/gris) évoquant confiance et sérieux
  - Primaire : Bleu institutionnel (#2563EB ou similaire)
  - Secondaire : Gris neutre
  - Accent : Vert pour succès/validation, Orange pour alertes
- **Typographie** : Police sans-serif lisible (Inter, Open Sans, ou système)
- **Style** : Clean, moderne, sans fioritures - focus sur le contenu
- **Logo** : Espace réservé pour logo ONG Chadia dans la navbar

### Target Device and Platforms

**Cible : Web Responsive**

| Plateforme | Support | Priorité |
|------------|---------|----------|
| Desktop (>1024px) | Optimisé | Principal |
| Tablette (768-1024px) | Adapté | Secondaire |
| Mobile (<768px) | Fonctionnel | Tertiaire |

**Navigateurs supportés :**
- Chrome (2 dernières versions)
- Firefox (2 dernières versions)
- Safari (2 dernières versions)
- Edge (2 dernières versions)

---

## Technical Assumptions

### Repository Structure: Monorepo

```
ong-chadia-platform/
├── apps/
│   ├── web/           # Frontend React
│   └── api/           # Backend Node.js
├── packages/
│   └── shared/        # Types et utilitaires partagés
├── docs/              # Documentation projet
└── package.json       # Workspace root
```

**Rationale :**
- Développeur solo (Adoum) → Monorepo simplifie la gestion
- Partage facile de types TypeScript entre frontend et backend
- Un seul repo à maintenir, CI/CD unifié

### Service Architecture: Monolith Modulaire

```
Backend (API)
├── modules/
│   ├── auth/          # Authentification & utilisateurs
│   ├── documents/     # GED
│   ├── projects/      # Gestion de projets
│   └── dashboard/     # Agrégation données dashboard
├── common/            # Middlewares, guards, utils
└── config/            # Configuration
```

**Rationale :**
- Simplicité pour MVP : Un seul déploiement, moins de complexité DevOps
- Adapté à l'équipe : 1 développeur, pas besoin de microservices
- Évolutif : Architecture modulaire permet extraction en services si besoin futur

### Testing Requirements: Unit + Integration

| Type | Scope | Outils |
|------|-------|--------|
| **Unit Tests** | Fonctions, services, composants isolés | Jest, React Testing Library |
| **Integration Tests** | API endpoints, flux utilisateur critiques | Supertest, Jest |
| **E2E Tests** | Hors scope MVP (Phase 2) | Playwright (futur) |

**Couverture cible MVP :**
- Modules Auth : 80%+ (critique sécurité)
- Modules GED : 70%+ (core business)
- Modules Projects : 60%+

### Stack Technique Détaillée

#### Frontend

| Technologie | Choix | Rationale |
|-------------|-------|-----------|
| Framework | **React 18+** | Maîtrisé par Adoum, écosystème riche |
| Language | **TypeScript** | Type safety, meilleure maintenabilité |
| Build Tool | **Vite** | Rapide, moderne, bonne DX |
| UI Library | **Tailwind CSS + shadcn/ui** | Productivité, composants accessibles |
| State Management | **Zustand** ou **TanStack Query** | Léger, simple, adapté au projet |
| Routing | **React Router v6** | Standard, bien documenté |
| Forms | **React Hook Form + Zod** | Validation robuste, performance |
| HTTP Client | **Axios** ou **TanStack Query** | Requêtes API |

#### Backend

| Technologie | Choix | Rationale |
|-------------|-------|-----------|
| Runtime | **Node.js 20 LTS** | Maîtrisé par Adoum |
| Framework | **Express.js** | Simplicité, rapidité de développement |
| Language | **TypeScript** | Cohérence avec frontend |
| ORM | **Prisma** | DX excellente, type-safe, migrations faciles |
| Validation | **Zod** | Partagé avec frontend |
| Auth | **JWT + bcrypt** | Standard, sécurisé |

#### Base de données & Stockage

| Service | Choix | Rationale |
|---------|-------|-----------|
| Database | **PostgreSQL** (Supabase) | Robuste, gratuit, RBAC natif |
| File Storage | **Supabase Storage** | Intégré, 1GB gratuit, S3-compatible |

#### Infrastructure MVP (100% Gratuit)

| Service | Provider | Limite Gratuite |
|---------|----------|-----------------|
| Frontend | **Vercel** | 100GB bandwidth/mois |
| Backend | **Railway** ou **Render** | 500h/mois (Railway) |
| Database | **Supabase** | 500MB DB, 1GB storage |
| CI/CD | **GitHub Actions** | 2000 min/mois |

#### Infrastructure Post-MVP

| Service | Provider | Coût Estimé |
|---------|----------|-------------|
| VPS | **Hetzner** ou **DigitalOcean** | ~$10-20/mois |
| Database | PostgreSQL sur VPS | Inclus |
| Storage | S3-compatible (Backblaze B2) | ~$5/mois |

### Conventions et Standards

- **Git Flow** simplifié : `main` (production), `develop` (staging), feature branches
- **Commits** : Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Linting** : ESLint + Prettier (config partagée)
- **Pre-commit hooks** : Husky + lint-staged

### Contraintes Techniques Identifiées

| Contrainte | Impact | Mitigation |
|------------|--------|------------|
| Limite 500MB DB Supabase | Volume documents limité | Stocker fichiers dans Storage, pas DB |
| Railway 500h/mois | Peut être atteint si trafic | Monitoring, optimisation, ou Render |
| Développeur solo | Vélocité limitée | Priorisation stricte, Micro-MVP |
| Deadline 1 mois | Scope très contraint | Focus GED + Projects uniquement |

---

## Epic List

### MICRO-MVP (Mois 1) - 4 Epics, 32 Stories

| Epic | Titre | Stories | Estimation |
|------|-------|---------|------------|
| **1** | **Foundation & Authentification** | 7 | ~25h |
| **2** | **GED - Gestion Documentaire** | 10 | ~35h |
| **3** | **Gestion de Projets** | 7 | ~21h |
| **4** | **Dashboard & Intégration** | 8 | ~20h |
| | **TOTAL MICRO-MVP** | **32** | **~100h** |

### PHASE 2 (Mois 2-4) - 3 Epics

| Epic | Titre | Objectif |
|------|-------|----------|
| **5** | **Veille Appels d'Offres** | Agréger et filtrer automatiquement les appels d'offres depuis sources multiples |
| **6** | **Templates & Propositions** | Système de templates réutilisables et composition de propositions |
| **7** | **Gestion Budgétaire** | Outils de création et suivi budgétaire avec calculs automatisés |

### Séquençage et Dépendances

```
MICRO-MVP (Semaines 1-4)
========================
Sem 1: Epic 1 (Foundation) + Epic 2 début (GED API)
Sem 2: Epic 2 suite (GED UI)
Sem 3: Epic 3 (Projets)
Sem 4: Epic 4 (Dashboard & Polish)

PHASE 2 (Semaines 5-16)
=======================
Epic 5: Veille ──► Epic 6: Templates ──► Epic 7: Budgets
```

---

## Epic 1: Foundation & Authentification

### Objectif

Établir les fondations techniques du projet (monorepo, base de données, CI/CD) et implémenter un système d'authentification complet avec gestion des utilisateurs à 4 niveaux de rôles (Super-Admin, Staff, Contributeur, Invité). À la fin de cet epic, l'application sera déployée avec un système de login fonctionnel et une interface d'administration des utilisateurs.

### Story 1.1: Project Setup & Infrastructure

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

### Story 1.2: Database Schema & Prisma Setup

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

### Story 1.3: Authentication API

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

### Story 1.4: Auth Middleware & Role Guards

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

### Story 1.5: User Management API

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

### Story 1.6: Login & Auth UI

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

### Story 1.7: User Management UI

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

## Epic 2: GED - Gestion Électronique de Documents

### Objectif

Implémenter un système complet de gestion électronique de documents permettant l'upload, l'organisation hiérarchique en dossiers, le contrôle d'accès granulaire par rôle, la recherche, et le versioning. À la fin de cet epic, l'équipe ONG pourra centraliser tous ses documents sensibles de manière sécurisée avec des permissions appropriées selon les rôles utilisateurs.

**C'est la priorité #1** : Résout directement le problème de sécurité documentaire et de dispersion des fichiers.

### Story 2.1: Folder Management API

**As a** utilisateur authentifié,
**I want** créer et organiser des dossiers hiérarchiques,
**so that** je puisse structurer mes documents de manière logique.

**Acceptance Criteria:**

1. Schéma Prisma `Folder` : id, name, parentId (nullable), createdById, createdAt, updatedAt
2. Endpoint `GET /api/folders` listant les dossiers racine de l'utilisateur
3. Endpoint `GET /api/folders/:id` récupérant un dossier avec ses sous-dossiers
4. Endpoint `GET /api/folders/:id/children` listant les sous-dossiers directs
5. Endpoint `POST /api/folders` créant un dossier (name, parentId optionnel)
6. Endpoint `PATCH /api/folders/:id` modifiant un dossier (name, parentId pour déplacer)
7. Endpoint `DELETE /api/folders/:id` supprimant un dossier vide uniquement
8. Validation : nom unique au sein du même parent
9. Validation : empêcher les cycles (un dossier ne peut être son propre descendant)
10. Tests unitaires et d'intégration

---

### Story 2.2: Folder Permissions API

**As a** Super-Admin ou Staff,
**I want** définir les permissions d'accès sur chaque dossier,
**so that** je puisse contrôler qui peut voir ou modifier les documents sensibles.

**Acceptance Criteria:**

1. Schéma Prisma `FolderPermission` : id, folderId, role (enum), permission (READ/WRITE/ADMIN)
2. Permissions héritées : un sous-dossier hérite des permissions du parent par défaut
3. Override possible : permissions spécifiques sur un sous-dossier remplacent l'héritage
4. Endpoint `GET /api/folders/:id/permissions` listant les permissions du dossier
5. Endpoint `POST /api/folders/:id/permissions` ajoutant une permission (Super-Admin/Staff only)
6. Endpoint `DELETE /api/folders/:id/permissions/:permId` supprimant une permission
7. Logique d'accès : Super-Admin a accès à tout, Staff selon permissions, Contributor/Guest restreints
8. Middleware `canAccessFolder(permission)` vérifiant l'accès avant toute opération
9. Tests couvrant tous les cas d'héritage et d'override
10. Documentation des règles de permissions

---

### Story 2.3: Document Upload & Storage API

**As a** utilisateur avec permission WRITE,
**I want** uploader des documents dans un dossier,
**so that** je puisse centraliser mes fichiers dans la GED.

**Acceptance Criteria:**

1. Schéma Prisma `Document` : id, name, mimeType, size, storagePath, folderId, uploadedById, createdAt
2. Intégration Supabase Storage configurée
3. Endpoint `POST /api/documents/upload` acceptant multipart/form-data
4. Upload vers Supabase Storage avec path structuré (`/org/{folderId}/{uuid}_{filename}`)
5. Limite de taille : 50 MB par fichier
6. Types acceptés : PDF, Word (.doc, .docx), Excel (.xls, .xlsx), images (jpg, png, gif), txt
7. Validation du type MIME côté serveur (pas seulement extension)
8. Métadonnées stockées en DB, fichier dans Storage
9. Retourne le document créé avec URL signée temporaire
10. Gestion d'erreurs : quota dépassé, type non supporté, upload failed
11. Tests d'intégration avec mock Storage

---

### Story 2.4: Document Operations API

**As a** utilisateur avec permissions appropriées,
**I want** télécharger, renommer, déplacer et supprimer des documents,
**so that** je puisse gérer mes fichiers efficacement.

**Acceptance Criteria:**

1. Endpoint `GET /api/documents/:id` récupérant les métadonnées d'un document
2. Endpoint `GET /api/documents/:id/download` retournant une URL signée pour téléchargement
3. Endpoint `GET /api/folders/:id/documents` listant les documents d'un dossier
4. Endpoint `PATCH /api/documents/:id` modifiant name ou folderId (déplacement)
5. Endpoint `DELETE /api/documents/:id` supprimant le document (Storage + DB)
6. Vérification des permissions : READ pour voir/télécharger, WRITE pour modifier/supprimer
7. Lors du déplacement, vérifier permission WRITE sur dossier source ET destination
8. Pagination sur la liste des documents (`?page=1&limit=50`)
9. Tri par nom, date, taille (`?sort=createdAt&order=desc`)
10. Tests d'intégration couvrant tous les cas de permissions

---

### Story 2.5: Document Versioning API

**As a** utilisateur,
**I want** uploader une nouvelle version d'un document existant,
**so that** je puisse maintenir un historique des modifications.

**Acceptance Criteria:**

1. Schéma Prisma `DocumentVersion` : id, documentId, versionNumber, storagePath, size, uploadedById, createdAt
2. Champ `currentVersionId` ajouté à `Document`
3. Endpoint `POST /api/documents/:id/versions` uploadant une nouvelle version
4. Version number auto-incrémenté (v1, v2, v3...)
5. Endpoint `GET /api/documents/:id/versions` listant toutes les versions
6. Endpoint `GET /api/documents/:id/versions/:versionId/download` téléchargeant une version spécifique
7. Possibilité de restaurer une ancienne version comme version courante
8. Conservation de toutes les versions (pas de suppression automatique pour MVP)
9. Affichage de la version courante par défaut
10. Tests couvrant upload version, listing, restauration

---

### Story 2.6: Document Search API

**As a** utilisateur,
**I want** rechercher des documents par nom et métadonnées,
**so that** je puisse retrouver rapidement les fichiers dont j'ai besoin.

**Acceptance Criteria:**

1. Endpoint `GET /api/documents/search?q=terme` recherchant dans les noms de documents
2. Recherche insensible à la casse et aux accents
3. Recherche partielle (contient le terme, pas exact match)
4. Filtrage par type de fichier (`?type=pdf,docx`)
5. Filtrage par dossier et sous-dossiers (`?folderId=xxx&recursive=true`)
6. Filtrage par date (`?from=2026-01-01&to=2026-01-31`)
7. Résultats respectant les permissions de l'utilisateur (ne voit que ce qu'il peut accéder)
8. Pagination des résultats
9. Performance : résultats en < 1 seconde pour base de données MVP
10. Tests avec différents scénarios de recherche et permissions

---

### Story 2.7: GED UI - Folder Explorer

**As a** utilisateur,
**I want** naviguer dans l'arborescence des dossiers via une interface graphique,
**so that** je puisse explorer et organiser ma structure documentaire.

**Acceptance Criteria:**

1. Page `/documents` avec panneau latéral d'arborescence de dossiers
2. Affichage hiérarchique des dossiers (tree view) avec expand/collapse
3. Breadcrumb montrant le chemin actuel
4. Clic sur un dossier affiche son contenu dans la zone principale
5. Menu contextuel (clic droit ou bouton "...") : Nouveau sous-dossier, Renommer, Déplacer, Supprimer
6. Modal de création de dossier avec validation du nom
7. Modal de confirmation avant suppression
8. Icônes différenciées pour dossiers selon permissions (cadenas pour restreint)
9. Drag & drop pour déplacer dossiers (optionnel, bonus)
10. État de chargement pendant les opérations

---

### Story 2.8: GED UI - Document List & Upload

**As a** utilisateur,
**I want** voir les documents d'un dossier et en uploader de nouveaux,
**so that** je puisse gérer mes fichiers depuis l'interface.

**Acceptance Criteria:**

1. Zone principale affichant la liste des documents du dossier sélectionné
2. Vue liste avec colonnes : Nom, Type (icône), Taille, Date upload, Uploadé par
3. Tri cliquable sur chaque colonne
4. Bouton "Upload" ouvrant un sélecteur de fichiers
5. Zone de drag & drop pour upload (drop zone visuelle)
6. Barre de progression pendant l'upload
7. Support upload multiple (plusieurs fichiers à la fois)
8. Validation côté client : taille max, types acceptés
9. Message d'erreur si upload échoue
10. Rafraîchissement automatique de la liste après upload réussi

---

### Story 2.9: GED UI - Document Details & Actions

**As a** utilisateur,
**I want** voir les détails d'un document et effectuer des actions,
**so that** je puisse télécharger, renommer, ou gérer les versions.

**Acceptance Criteria:**

1. Clic sur un document ouvre un panneau de détails (drawer ou modal)
2. Affichage : nom, type, taille, date création, uploadé par, dossier parent
3. Prévisualisation inline pour PDF et images (si possible)
4. Bouton "Télécharger" récupérant le fichier
5. Bouton "Renommer" avec formulaire inline
6. Bouton "Déplacer" ouvrant un sélecteur de dossier destination
7. Bouton "Supprimer" avec confirmation
8. Section "Versions" listant l'historique des versions
9. Bouton "Uploader nouvelle version"
10. Lien de chaque version pour télécharger une version spécifique

---

### Story 2.10: Document Sharing & Access Logs

**As a** Staff ou Super-Admin,
**I want** partager un document via lien sécurisé et voir qui y a accédé,
**so that** je puisse collaborer avec des partenaires externes et auditer les accès.

**Acceptance Criteria:**

1. Schéma Prisma `ShareLink` : id, documentId, token (unique), expiresAt, createdById, accessCount
2. Schéma Prisma `AccessLog` : id, documentId, userId (nullable pour liens), action, ipAddress, createdAt
3. Endpoint `POST /api/documents/:id/share` créant un lien de partage avec expiration
4. Endpoint `GET /api/share/:token` permettant téléchargement sans auth (lien public temporaire)
5. Bouton "Partager" dans l'UI générant et affichant le lien
6. Option de durée d'expiration (1h, 24h, 7 jours, 30 jours)
7. Logging automatique de tous les accès aux documents sensibles
8. Endpoint `GET /api/documents/:id/access-logs` listant les accès (Super-Admin)
9. UI affichant les logs d'accès dans les détails du document (si autorisé)
10. Tests de sécurité : lien expiré retourne 403, token invalide retourne 404

---

## Epic 3: Gestion de Projets

### Objectif

Permettre la création, le suivi et la gestion complète des projets de l'ONG avec assignation d'équipes (permanents + bénévoles), suivi des phases d'avancement, et liaison automatique avec les documents de la GED. À la fin de cet epic, l'équipe pourra gérer le nouveau projet financé qui démarre dans 1 mois.

### Story 3.1: Project Model & CRUD API

**As a** utilisateur Staff ou Super-Admin,
**I want** créer et gérer des fiches projet via API,
**so that** je puisse centraliser les informations de tous nos projets.

**Acceptance Criteria:**

1. Schéma Prisma `Project` : id, name, description, status (enum), startDate, endDate, budget, createdById, createdAt, updatedAt
2. Enum `ProjectStatus` : DRAFT, PREPARATION, IN_PROGRESS, COMPLETED, CANCELLED
3. Endpoint `GET /api/projects` listant tous les projets accessibles à l'utilisateur
4. Endpoint `GET /api/projects/:id` récupérant un projet avec ses détails
5. Endpoint `POST /api/projects` créant un projet (Staff+ only)
6. Endpoint `PATCH /api/projects/:id` modifiant un projet
7. Endpoint `DELETE /api/projects/:id` archivant un projet (soft delete, Super-Admin only)
8. Filtrage par statut (`?status=IN_PROGRESS`)
9. Pagination et tri (`?page=1&limit=20&sort=startDate`)
10. Tests d'intégration pour tous les endpoints

---

### Story 3.2: Team Assignment API

**As a** Staff ou Super-Admin,
**I want** assigner des membres d'équipe à un projet,
**so that** je puisse constituer l'équipe projet (permanents + bénévoles).

**Acceptance Criteria:**

1. Schéma Prisma `ProjectMember` : id, projectId, userId, role (PROJECT_MANAGER, MEMBER, VOLUNTEER), assignedAt
2. Endpoint `GET /api/projects/:id/members` listant les membres du projet
3. Endpoint `POST /api/projects/:id/members` ajoutant un membre avec son rôle projet
4. Endpoint `PATCH /api/projects/:id/members/:memberId` modifiant le rôle d'un membre
5. Endpoint `DELETE /api/projects/:id/members/:memberId` retirant un membre
6. Validation : un utilisateur ne peut être assigné qu'une fois par projet
7. Validation : au moins un PROJECT_MANAGER requis par projet
8. Les Contributors peuvent être assignés comme VOLUNTEER uniquement
9. Notification (log) lors de l'ajout/retrait d'un membre
10. Tests couvrant les cas de validation

---

### Story 3.3: Project-Document Linking API

**As a** membre d'un projet,
**I want** lier des documents de la GED au projet,
**so that** tous les documents pertinents soient accessibles depuis la fiche projet.

**Acceptance Criteria:**

1. Schéma Prisma `ProjectDocument` : id, projectId, documentId, linkedById, linkedAt
2. Endpoint `GET /api/projects/:id/documents` listant les documents liés au projet
3. Endpoint `POST /api/projects/:id/documents` liant un document existant au projet
4. Endpoint `DELETE /api/projects/:id/documents/:docId` déliant un document
5. Possibilité de lier un dossier entier (tous ses documents)
6. Vérification : l'utilisateur doit avoir accès READ au document pour le lier
7. Les membres du projet obtiennent automatiquement accès READ aux documents liés
8. Un document peut être lié à plusieurs projets
9. Affichage du nombre de documents liés sur la fiche projet
10. Tests d'intégration

---

### Story 3.4: Projects List UI

**As a** utilisateur,
**I want** voir la liste de tous les projets auxquels j'ai accès,
**so that** je puisse naviguer rapidement vers le projet qui m'intéresse.

**Acceptance Criteria:**

1. Page `/projects` affichant la liste des projets
2. Vue cards ou tableau avec : Nom, Statut (badge coloré), Dates, Budget, Nb membres
3. Filtres : par statut, par date (en cours, à venir, terminés)
4. Recherche par nom de projet
5. Tri par nom, date de début, statut
6. Pagination
7. Bouton "Nouveau projet" (visible si Staff+)
8. Clic sur un projet navigue vers sa page de détail
9. Indicateur visuel pour projets où l'utilisateur est assigné
10. État vide avec message si aucun projet

---

### Story 3.5: Project Detail UI

**As a** membre d'un projet,
**I want** voir tous les détails d'un projet sur une page dédiée,
**so that** j'aie une vue complète du projet et de son avancement.

**Acceptance Criteria:**

1. Page `/projects/:id` avec informations complètes du projet
2. Header : Nom, Statut (modifiable si autorisé), Dates début/fin
3. Section "Description" avec texte riche
4. Section "Budget" affichant le montant
5. Section "Équipe" listant tous les membres avec leurs rôles projet
6. Section "Documents" listant les documents liés (avec liens vers GED)
7. Section "Avancement" avec indicateur de phase actuelle
8. Bouton "Modifier" (Staff+) ouvrant le formulaire d'édition
9. Bouton "Gérer l'équipe" ouvrant le panneau d'assignation
10. Breadcrumb : Projets > Nom du projet

---

### Story 3.6: Project Create/Edit UI

**As a** Staff ou Super-Admin,
**I want** créer et modifier des projets via formulaire,
**so that** je puisse ajouter de nouveaux projets et mettre à jour les existants.

**Acceptance Criteria:**

1. Page `/projects/new` avec formulaire de création
2. Champs : Nom*, Description, Statut, Date début, Date fin, Budget
3. Validation : nom requis, dates cohérentes (fin >= début)
4. Mode édition sur `/projects/:id/edit` pré-remplissant les valeurs
5. Boutons "Enregistrer" et "Annuler"
6. Redirection vers page de détail après création/modification réussie
7. Messages d'erreur inline pour validation
8. Toast de confirmation après succès
9. Auto-save brouillon (optionnel, bonus)
10. Responsive : formulaire adapté mobile

---

### Story 3.7: Team Management UI

**As a** Staff ou Super-Admin,
**I want** gérer l'équipe d'un projet via interface graphique,
**so that** je puisse ajouter, modifier ou retirer des membres facilement.

**Acceptance Criteria:**

1. Panneau/Modal "Gérer l'équipe" accessible depuis page projet
2. Liste des membres actuels avec : Nom, Email, Rôle projet, Date assignation
3. Bouton "Ajouter membre" ouvrant un sélecteur d'utilisateurs
4. Sélecteur filtrant par rôle système (Staff, Contributor)
5. Choix du rôle projet lors de l'ajout (PROJECT_MANAGER, MEMBER, VOLUNTEER)
6. Action "Modifier rôle" sur chaque membre
7. Action "Retirer" avec confirmation
8. Validation : impossible de retirer le dernier PROJECT_MANAGER
9. Mise à jour en temps réel de la liste après modification
10. Indicateur du nombre de membres

---

## Epic 4: Dashboard & Intégration

### Objectif

Créer le tableau de bord unifié servant de point d'entrée principal à l'application, intégrant les données des modules GED et Projets, avec alertes sur les échéances et accès rapide aux actions fréquentes. À la fin de cet epic, l'application Micro-MVP sera complète et prête pour la production.

### Story 4.1: Dashboard API - Aggregated Data

**As a** utilisateur authentifié,
**I want** récupérer les données agrégées pour mon dashboard via API,
**so that** l'interface puisse afficher une vue d'ensemble personnalisée.

**Acceptance Criteria:**

1. Endpoint `GET /api/dashboard` retournant les données agrégées
2. Données retournées :
   - `projects`: { total, byStatus: { draft, preparation, inProgress, completed } }
   - `myProjects`: liste des 5 derniers projets où l'utilisateur est assigné
   - `recentDocuments`: 10 derniers documents uploadés accessibles à l'utilisateur
   - `upcomingDeadlines`: projets avec endDate dans les 30 prochains jours
   - `stats`: { totalDocuments, totalProjects, totalUsers (si admin) }
3. Données filtrées selon permissions de l'utilisateur
4. Cache côté serveur (5 min) pour performance
5. Endpoint `GET /api/dashboard/activity` pour activité récente (uploads, créations)
6. Pagination sur l'activité récente
7. Performance : réponse < 500ms
8. Tests d'intégration validant les permissions

---

### Story 4.2: Dashboard UI - Main Layout

**As a** utilisateur authentifié,
**I want** voir un tableau de bord avec vue d'ensemble dès ma connexion,
**so that** je puisse rapidement accéder aux informations importantes.

**Acceptance Criteria:**

1. Page `/dashboard` définie comme page d'accueil après login
2. Layout responsive avec grille de widgets/cards
3. Header avec : Bienvenue {prénom}, date du jour
4. Navigation principale (sidebar ou top nav) vers : Dashboard, Documents, Projets, Admin (si autorisé)
5. Skeleton loading pendant chargement des données
6. Gestion d'erreur si API échoue (retry, message)
7. Bouton de rafraîchissement manuel
8. Design cohérent avec la charte (couleurs, typographie)
9. Adapté mobile : cards empilées verticalement
10. Temps de chargement initial < 2 secondes

---

### Story 4.3: Dashboard UI - Projects Widget

**As a** utilisateur,
**I want** voir mes projets actifs sur le dashboard,
**so that** je puisse accéder rapidement à mes projets en cours.

**Acceptance Criteria:**

1. Widget "Mes Projets" affichant les 5 projets récents de l'utilisateur
2. Chaque projet montre : Nom, Statut (badge), Date fin
3. Indicateur visuel si deadline proche (< 7 jours)
4. Clic sur un projet navigue vers sa page de détail
5. Lien "Voir tous les projets" vers `/projects`
6. État vide : "Aucun projet assigné" avec lien vers liste projets
7. Compteur de projets par statut (mini graphique ou badges)
8. Bouton "Nouveau projet" (si autorisé)
9. Widget responsive (s'adapte à la largeur)
10. Chargement asynchrone indépendant

---

### Story 4.4: Dashboard UI - Documents Widget

**As a** utilisateur,
**I want** voir les documents récents sur le dashboard,
**so that** je puisse accéder rapidement aux derniers fichiers uploadés.

**Acceptance Criteria:**

1. Widget "Documents Récents" affichant les 10 derniers documents
2. Chaque document montre : Nom, Type (icône), Date upload, Dossier parent
3. Clic sur un document ouvre ses détails (ou télécharge directement)
4. Clic sur le dossier navigue vers ce dossier dans la GED
5. Lien "Voir tous les documents" vers `/documents`
6. Bouton "Upload" rapide ouvrant le sélecteur de fichiers
7. Indication du quota utilisé (X GB / 25 GB) si pertinent
8. État vide : "Aucun document" avec CTA pour uploader
9. Recherche rapide dans le widget (optionnel)
10. Filtrable par type de fichier (optionnel)

---

### Story 4.5: Dashboard UI - Alerts & Deadlines Widget

**As a** utilisateur,
**I want** voir les alertes et échéances importantes,
**so that** je ne manque pas les deadlines critiques.

**Acceptance Criteria:**

1. Widget "Échéances" listant les projets avec deadline proche
2. Seuils : Rouge (< 7 jours), Orange (< 14 jours), Jaune (< 30 jours)
3. Format : Nom projet, Date fin, Jours restants
4. Tri par urgence (plus proche en premier)
5. Maximum 5 éléments affichés, lien "Voir plus" si plus
6. Widget "Alertes" pour notifications système (optionnel MVP)
7. Possibilité de marquer une alerte comme "vue"
8. Animation subtile pour nouvelles alertes
9. État vide : "Aucune échéance proche" (message positif)
10. Clic sur échéance navigue vers le projet

---

### Story 4.6: Global Search

**As a** utilisateur,
**I want** rechercher globalement dans l'application,
**so that** je puisse trouver rapidement documents ou projets.

**Acceptance Criteria:**

1. Barre de recherche dans le header/navbar, accessible partout
2. Endpoint `GET /api/search?q=terme` recherchant dans documents ET projets
3. Résultats groupés par type (Documents, Projets)
4. Affichage en dropdown sous la barre de recherche
5. Navigation clavier (flèches, Enter pour sélectionner)
6. Raccourci clavier pour focus (Ctrl+K ou Cmd+K)
7. Recherche en temps réel avec debounce (300ms)
8. Maximum 5 résultats par catégorie dans le dropdown
9. Lien "Voir tous les résultats" ouvrant page de résultats complète
10. Résultats respectant les permissions utilisateur

---

### Story 4.7: Final Integration & Polish

**As a** utilisateur,
**I want** une application cohérente et polie,
**so that** l'expérience soit professionnelle et agréable.

**Acceptance Criteria:**

1. Navigation cohérente sur toutes les pages (sidebar/navbar identique)
2. Breadcrumbs sur toutes les pages de détail
3. Page 404 personnalisée
4. Page d'erreur générique (500)
5. Favicon et titre de page dynamique
6. Meta tags pour SEO basique (title, description)
7. Loading states cohérents (skeleton ou spinner)
8. Toasts de notification cohérents (succès, erreur, info)
9. Confirmation avant actions destructives (supprimer)
10. Tests E2E des parcours critiques : Login → Dashboard → GED → Upload → Projet

---

### Story 4.8: Production Readiness

**As a** développeur,
**I want** préparer l'application pour la production,
**so that** le déploiement soit sécurisé et monitoré.

**Acceptance Criteria:**

1. Variables d'environnement production configurées (DB, Storage, JWT secrets)
2. CORS configuré correctement (domaines autorisés)
3. Rate limiting sur les endpoints API sensibles (login, register)
4. Helmet.js configuré pour headers de sécurité
5. Logs structurés (JSON) pour debugging production
6. Health check endpoint `GET /api/health`
7. Build production optimisé (minification, tree-shaking)
8. Documentation déploiement dans README
9. Seed de données initiales (Super-Admin, dossiers par défaut)
10. Backup manuel de la base de données documenté

---

## Checklist Results Report

### Executive Summary

| Critère | Évaluation |
|---------|------------|
| **Complétude PRD** | 95% |
| **Scope MVP** | Approprié (Just Right) |
| **Prêt pour Architecture** | ✅ READY |

### Category Statuses

| Category | Status | Notes |
|----------|--------|-------|
| 1. Problem Definition & Context | ✅ PASS | Problème bien articulé, métriques de succès définies |
| 2. MVP Scope Definition | ✅ PASS | Scope clair, Phase 2 bien délimitée |
| 3. User Experience Requirements | ✅ PASS | 9 écrans MVP définis, paradigmes d'interaction clairs |
| 4. Functional Requirements | ✅ PASS | 29 FR documentés avec identifiants |
| 5. Non-Functional Requirements | ✅ PASS | 20 NFR couvrant performance, sécurité, conformité |
| 6. Epic & Story Structure | ✅ PASS | 4 epics, 32 stories avec ACs testables |
| 7. Technical Guidance | ✅ PASS | Stack définie, contraintes documentées |
| 8. Cross-Functional Requirements | ✅ PASS | Schémas DB identifiés, intégrations listées |
| 9. Clarity & Communication | ✅ PASS | Document structuré, terminologie cohérente |

### Risques Identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Timeline serré (4 semaines) | HAUT | Priorisation stricte, scope Micro-MVP |
| Développeur solo | MOYEN | Stories bien découpées, support IA |
| Limites tier gratuit | MOYEN | Monitoring usage, plan migration VPS |
| Complexité permissions GED | MOYEN | Tests exhaustifs, documentation |

### Recommandations

1. **Commencer immédiatement** - Le projet est prêt pour la phase d'architecture
2. **Prioriser Epic 1 et 2** - Foundation et GED sont critiques
3. **Réduire scope si nécessaire** - Stories marquées "optionnel" peuvent être reportées
4. **Tester les permissions tôt** - Complexité élevée, prévoir du temps

### Final Decision

**✅ READY FOR ARCHITECT** : Le PRD est complet, bien structuré, et prêt pour la conception architecturale.

---

## Next Steps

### Prochaine Étape Immédiate

**Créer le document d'Architecture** avec l'agent `/architect` en utilisant ce PRD comme entrée.

### UX Expert Prompt

```
Utiliser le PRD docs/prd.md pour créer les wireframes et maquettes
des écrans principaux du Micro-MVP :
1. Login
2. Dashboard
3. GED (Folder Explorer + Document List)
4. Projet (Liste + Détail)
5. Administration Utilisateurs

Focus sur l'efficacité et la simplicité pour une équipe ONG.
```

### Architect Prompt

```
Utiliser le PRD docs/prd.md pour créer le document d'architecture
technique incluant :
1. Schéma de base de données complet (Prisma)
2. Architecture API (endpoints, middlewares)
3. Structure du code (monorepo)
4. Diagrammes de séquence pour flux critiques
5. Plan de déploiement (Vercel + Railway + Supabase)
```

---

## Annexes

### Récapitulatif des Stories

| Epic | Story | Titre | Estimation |
|------|-------|-------|------------|
| 1 | 1.1 | Project Setup & Infrastructure | 4h |
| 1 | 1.2 | Database Schema & Prisma Setup | 3h |
| 1 | 1.3 | Authentication API | 4h |
| 1 | 1.4 | Auth Middleware & Role Guards | 3h |
| 1 | 1.5 | User Management API | 4h |
| 1 | 1.6 | Login & Auth UI | 4h |
| 1 | 1.7 | User Management UI | 3h |
| 2 | 2.1 | Folder Management API | 3h |
| 2 | 2.2 | Folder Permissions API | 4h |
| 2 | 2.3 | Document Upload & Storage API | 4h |
| 2 | 2.4 | Document Operations API | 3h |
| 2 | 2.5 | Document Versioning API | 3h |
| 2 | 2.6 | Document Search API | 3h |
| 2 | 2.7 | GED UI - Folder Explorer | 4h |
| 2 | 2.8 | GED UI - Document List & Upload | 4h |
| 2 | 2.9 | GED UI - Document Details & Actions | 3h |
| 2 | 2.10 | Document Sharing & Access Logs | 4h |
| 3 | 3.1 | Project Model & CRUD API | 3h |
| 3 | 3.2 | Team Assignment API | 3h |
| 3 | 3.3 | Project-Document Linking API | 3h |
| 3 | 3.4 | Projects List UI | 3h |
| 3 | 3.5 | Project Detail UI | 3h |
| 3 | 3.6 | Project Create/Edit UI | 3h |
| 3 | 3.7 | Team Management UI | 3h |
| 4 | 4.1 | Dashboard API - Aggregated Data | 3h |
| 4 | 4.2 | Dashboard UI - Main Layout | 3h |
| 4 | 4.3 | Dashboard UI - Projects Widget | 2h |
| 4 | 4.4 | Dashboard UI - Documents Widget | 2h |
| 4 | 4.5 | Dashboard UI - Alerts & Deadlines | 2h |
| 4 | 4.6 | Global Search | 3h |
| 4 | 4.7 | Final Integration & Polish | 3h |
| 4 | 4.8 | Production Readiness | 2h |
| | | **TOTAL** | **~100h** |

---

_Document généré avec BMAD-METHOD™_
_PRD Version 1.0 - Finalisé le 2026-01-20_
