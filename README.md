# ONG Chadia Platform

Plateforme de gestion documentaire et de projets pour l'ONG Chadia.

## Prérequis

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0

## Installation

```bash
# Cloner le repository
git clone <repository-url>
cd ong-chadia-platform

# Installer les dépendances
pnpm install

# Copier les fichiers d'environnement
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# Configurer les variables d'environnement dans les fichiers .env
```

## Scripts disponibles

```bash
# Développement
pnpm dev        # Lance frontend et backend en parallèle
pnpm dev:web    # Lance uniquement le frontend
pnpm dev:api    # Lance uniquement le backend

# Build
pnpm build      # Build tous les packages

# Qualité de code
pnpm lint       # Lint tous les packages
pnpm test       # Tests tous les packages

# Base de données
pnpm db:generate  # Génère le Prisma Client
pnpm db:migrate   # Crée et applique les migrations
pnpm db:push      # Push le schéma vers la DB (dev only)
pnpm db:seed      # Seed la base de données
pnpm db:studio    # Ouvre Prisma Studio (GUI)
```

## Base de données

### Configuration

La base de données utilise PostgreSQL hébergé sur Supabase. Configurez les variables dans `apps/api/.env`:

```bash
# Connection pooler (pour les requêtes)
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connection directe (pour les migrations)
DIRECT_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
```

### Schéma

```
┌─────────────────────────────────────┐
│              users                  │
├─────────────────────────────────────┤
│ id           UUID (PK)              │
│ email        VARCHAR UNIQUE         │
│ password_hash VARCHAR               │
│ first_name   VARCHAR                │
│ last_name    VARCHAR                │
│ role         ENUM (Role)            │
│ is_active    BOOLEAN                │
│ created_at   TIMESTAMP              │
│ updated_at   TIMESTAMP              │
└─────────────────────────────────────┘

Role: SUPER_ADMIN | STAFF | CONTRIBUTOR | GUEST
```

### Super Admin par défaut

Après `pnpm db:seed`:
- **Email**: admin@ong-chadia.org
- **Password**: Admin123!

## Structure du projet

```
ong-chadia-platform/
├── apps/
│   ├── web/                # Frontend React + Vite
│   └── api/                # Backend Express
├── packages/
│   └── shared/             # Types et utilitaires partagés
├── prisma/                 # Schéma et migrations (Story 1.2)
├── docs/                   # Documentation
└── scripts/                # Scripts utilitaires
```

## Technologies

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |

## Déploiement

- **Frontend**: Vercel (auto-deploy sur push)
- **Backend**: Railway

## License

Private - ONG Chadia
