# 16. Testing Strategy

## 16.1 Testing Pyramid

```
        E2E Tests (5-10)         ← Critical paths only (Phase 2)
       /              \
   Integration (30-50)           ← API endpoints
  /                    \
Unit Tests (100+)                ← Services, hooks, utils
```

## 16.2 Coverage Targets

| Module | Target |
|--------|--------|
| Auth Services | 80%+ |
| Permission Services | 80%+ |
| Document Services | 70%+ |
| Project Services | 60%+ |
| Frontend Hooks | 60%+ |

## 16.3 Test Examples

**Backend Unit Test:**
```typescript
// tests/unit/auth.service.test.ts
describe('AuthService', () => {
  it('hashes password with bcrypt', async () => {
    const hash = await authService.hashPassword('Password123!');
    expect(hash).not.toBe('Password123!');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('validates correct password', async () => {
    const hash = await authService.hashPassword('Password123!');
    const isValid = await authService.comparePassword('Password123!', hash);
    expect(isValid).toBe(true);
  });
});
```

**Backend Integration Test:**
```typescript
// tests/integration/auth.test.ts
describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    await createTestUser({ email: 'user@test.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('returns 401 for invalid password', async () => {
    await createTestUser({ email: 'user@test.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'WrongPassword!' });

    expect(response.status).toBe(401);
  });
});
```

---
