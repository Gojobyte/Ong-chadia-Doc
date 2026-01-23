# Technical Assumptions

## Repository Structure: Monorepo

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

## Service Architecture: Monolith Modulaire

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

## Testing Requirements: Unit + Integration

| Type | Scope | Outils |
|------|-------|--------|
| **Unit Tests** | Fonctions, services, composants isolés | Jest, React Testing Library |
| **Integration Tests** | API endpoints, flux utilisateur critiques | Supertest, Jest |
| **E2E Tests** | Hors scope MVP (Phase 2) | Playwright (futur) |

**Couverture cible MVP :**
- Modules Auth : 80%+ (critique sécurité)
- Modules GED : 70%+ (core business)
- Modules Projects : 60%+

## Stack Technique Détaillée

### Frontend

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

### Backend

| Technologie | Choix | Rationale |
|-------------|-------|-----------|
| Runtime | **Node.js 20 LTS** | Maîtrisé par Adoum |
| Framework | **Express.js** | Simplicité, rapidité de développement |
| Language | **TypeScript** | Cohérence avec frontend |
| ORM | **Prisma** | DX excellente, type-safe, migrations faciles |
| Validation | **Zod** | Partagé avec frontend |
| Auth | **JWT + bcrypt** | Standard, sécurisé |

### Base de données & Stockage

| Service | Choix | Rationale |
|---------|-------|-----------|
| Database | **PostgreSQL** (Supabase) | Robuste, gratuit, RBAC natif |
| File Storage | **Supabase Storage** | Intégré, 1GB gratuit, S3-compatible |

### Infrastructure MVP (100% Gratuit)

| Service | Provider | Limite Gratuite |
|---------|----------|-----------------|
| Frontend | **Vercel** | 100GB bandwidth/mois |
| Backend | **Railway** ou **Render** | 500h/mois (Railway) |
| Database | **Supabase** | 500MB DB, 1GB storage |
| CI/CD | **GitHub Actions** | 2000 min/mois |

### Infrastructure Post-MVP

| Service | Provider | Coût Estimé |
|---------|----------|-------------|
| VPS | **Hetzner** ou **DigitalOcean** | ~$10-20/mois |
| Database | PostgreSQL sur VPS | Inclus |
| Storage | S3-compatible (Backblaze B2) | ~$5/mois |

## Conventions et Standards

- **Git Flow** simplifié : `main` (production), `develop` (staging), feature branches
- **Commits** : Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Linting** : ESLint + Prettier (config partagée)
- **Pre-commit hooks** : Husky + lint-staged

## Contraintes Techniques Identifiées

| Contrainte | Impact | Mitigation |
|------------|--------|------------|
| Limite 500MB DB Supabase | Volume documents limité | Stocker fichiers dans Storage, pas DB |
| Railway 500h/mois | Peut être atteint si trafic | Monitoring, optimisation, ou Render |
| Développeur solo | Vélocité limitée | Priorisation stricte, Micro-MVP |
| Deadline 1 mois | Scope très contraint | Focus GED + Projects uniquement |

---
