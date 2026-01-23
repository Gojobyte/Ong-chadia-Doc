# 13. Development Workflow

## 13.1 Local Setup

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

## 13.2 Development Commands

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

## 13.3 Git Workflow

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
