# 19. Monitoring and Observability

## 19.1 Monitoring Stack

| Component | Tool |
|-----------|------|
| Frontend | Vercel Analytics |
| Backend | Railway Metrics + Logs |
| Uptime | UptimeRobot |
| Logging | Pino (JSON) |

## 19.2 Logging

```typescript
// common/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'req.body.password'],
});

// Usage
logger.info({ userId, documentId }, 'Document uploaded');
logger.error({ err, requestId }, 'Upload failed');
```

## 19.3 Health Check

```typescript
// GET /api/health
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy' });
  }
});
```

---
