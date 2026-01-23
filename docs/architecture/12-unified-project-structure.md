# 12. Unified Project Structure

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

## Root package.json

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

## pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---
