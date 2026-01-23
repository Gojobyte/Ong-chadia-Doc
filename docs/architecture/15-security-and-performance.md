# 15. Security and Performance

## 15.1 Security Requirements

**Frontend Security:**
- CSP Headers configured
- XSS prevention (React escaping)
- Tokens in memory (not localStorage for sensitive)

**Backend Security:**
- Input validation (Zod on all endpoints)
- Rate limiting (5 req/15min on auth)
- CORS restrictif
- Helmet.js headers
- Passwords: bcrypt 12 rounds
- JWT: 15min access, 7d refresh

**Authentication Security:**
```typescript
// Password policy
const passwordSchema = z.string()
  .min(8, 'Min 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number');

// Bcrypt rounds
const BCRYPT_ROUNDS = 12;

// JWT expiry
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';
```

## 15.2 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| API Response (p95) | < 200ms |
| Document Search | < 1s |
| File Upload (10MB) | < 5s |

## 15.3 Performance Optimization

**Frontend:**
- Code splitting (lazy routes)
- TanStack Query caching (5min stale time)
- Image lazy loading

**Backend:**
- Database indexes on frequent queries
- Prisma select (only needed fields)
- Pagination everywhere
- Connection pooling (Supabase)

---
