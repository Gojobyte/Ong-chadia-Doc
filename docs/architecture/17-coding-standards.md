# 17. Coding Standards

## 17.1 Critical Rules

1. **Types dans `packages/shared`** - Jamais dupliquer entre frontend/backend
2. **API calls via services** - Jamais `fetch` direct
3. **Environment via config** - Jamais `process.env` direct dans le code métier
4. **Toujours vérifier les permissions** avant opérations sur documents/dossiers
5. **Toujours paginer** les listes
6. **Jamais logger** les mots de passe ou tokens

## 17.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `DocumentCard.tsx` |
| Hooks | camelCase + use | `useDocuments.ts` |
| Services | camelCase.service | `documents.service.ts` |
| API Routes | kebab-case | `/folder-permissions` |
| DB Tables | snake_case | `folder_permissions` |
| Enums | UPPER_SNAKE | `PROJECT_MANAGER` |

## 17.3 Code Patterns

```typescript
// ✅ CORRECT - API response
res.json({ data: documents, pagination: { page, limit, total, totalPages } });

// ❌ WRONG
res.json(documents);

// ✅ CORRECT - Permission check
const canAccess = await permissionsService.canAccess(userId, folderId, Permission.READ);
if (!canAccess) throw new ForbiddenError();

// ❌ WRONG - No check
return prisma.document.findUnique({ where: { id } });

// ✅ CORRECT - Pagination
const docs = await prisma.document.findMany({ skip, take: limit });

// ❌ WRONG
const docs = await prisma.document.findMany();
```

---
