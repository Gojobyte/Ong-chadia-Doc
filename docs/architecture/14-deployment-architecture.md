# 14. Deployment Architecture

## 14.1 Deployment Strategy

| Component | Platform | Method |
|-----------|----------|--------|
| Frontend | Vercel | Auto-deploy on push to main |
| Backend | Railway | Auto-deploy on push to main |
| Database | Supabase | Managed (migrations via CI) |

## 14.2 CI/CD Pipeline

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

## 14.3 Environments

| Environment | Frontend URL | Backend URL |
|-------------|--------------|-------------|
| Development | localhost:5173 | localhost:3001 |
| Production | app.ong-chadia.org | api.ong-chadia.org |

---
