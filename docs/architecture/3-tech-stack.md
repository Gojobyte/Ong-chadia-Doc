# 3. Tech Stack

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

## Versions Node.js & Package Manager

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20 LTS | Support long terme, dernières features |
| **pnpm** | 8.x | Workspace support, rapide, économe disque |

---
