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

## Deploiement Production

### Prerequis

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 14 (avec SSL)
- **Supabase** (pour le stockage des fichiers)
- Serveur avec HTTPS configure

### Configuration

1. **Variables d'environnement**

   Copier et configurer le fichier d'environnement production:

   ```bash
   cp apps/api/.env.production.example apps/api/.env
   ```

   Variables requises:
   - `DATABASE_URL` - Connection string PostgreSQL avec SSL
   - `SUPABASE_URL` - URL du projet Supabase
   - `SUPABASE_SERVICE_KEY` - Cle de service Supabase
   - `JWT_SECRET` - Secret JWT (generer avec `openssl rand -base64 64`)
   - `CORS_ORIGIN` - Domaine(s) autorises (comma-separated)

2. **Base de donnees**

   ```bash
   # Appliquer les migrations
   pnpm db:migrate

   # Initialiser les donnees par defaut
   pnpm db:seed
   ```

3. **Build**

   ```bash
   # Build le frontend et l'API
   pnpm build
   ```

### Demarrage

```bash
# Backend (Express API)
cd apps/api && NODE_ENV=production node dist/index.cjs

# Frontend (servir les fichiers statiques avec nginx ou similar)
# Les fichiers sont dans apps/web/dist/
```

### Endpoints de sante

- `GET /api/health` - Verification complete (DB + Storage)
- `GET /api/health/live` - Liveness probe (serveur actif)
- `GET /api/health/ready` - Readiness probe (DB connectee)

### Securite

L'API inclut:
- **Helmet.js** - Headers de securite HTTP
- **Rate Limiting** - Login: 5 req/min, Register: 3 req/min
- **CORS** - Liste blanche des domaines
- **JWT** - Tokens avec expiration

### Backup Base de Donnees

```bash
# Exporter la base de donnees
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restaurer depuis un backup
psql $DATABASE_URL < backup_20260128.sql
```

### Monitoring

Les logs sont structures en JSON (via Pino) pour integration avec:
- ELK Stack
- CloudWatch Logs
- Datadog
- etc.

---

## Deploiement Rapide

- **Frontend**: Vercel (auto-deploy sur push)
- **Backend**: Railway

## License

Private - ONG Chadia
