# 7. External APIs

## 7.1 Supabase Storage API

- **Purpose:** Stockage des documents GED (fichiers PDF, Word, Excel, images)
- **Documentation:** https://supabase.com/docs/guides/storage
- **Base URL:** `https://<project-ref>.supabase.co/storage/v1`
- **Authentication:** API Key (service role pour backend) + JWT user pour signed URLs
- **Rate Limits:** Tier gratuit: 1GB storage, 2GB bandwidth/mois

**Key Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/object/{bucket}/{path}` | Upload fichier |
| GET | `/object/{bucket}/{path}` | Télécharger fichier |
| DELETE | `/object/{bucket}/{path}` | Supprimer fichier |
| POST | `/object/sign/{bucket}/{path}` | Générer URL signée |

**Integration Code:**
```typescript
// apps/api/src/lib/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const storage = {
  async upload(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: false });
    if (error) throw error;
    return data;
  },

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  async delete(bucket: string, paths: string[]) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  }
};
```

## 7.2 Supabase PostgreSQL

- **Purpose:** Base de données principale
- **Connection:** Via Prisma ORM (pas Supabase JS client pour DB)
- **Limits:** Tier gratuit: 500MB storage, 60 connexions (pooler)

## 7.3 Environment Variables

```bash
# apps/api/.env

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # Service role key (NEVER expose)
SUPABASE_ANON_KEY=eyJ...

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.<ref>.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.<ref>.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-other-256-bit-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://app.ong-chadia.org
```

```bash
# apps/web/.env.local

VITE_API_URL=https://api.ong-chadia.org/api
VITE_APP_NAME="ONG Chadia Platform"
```

---
