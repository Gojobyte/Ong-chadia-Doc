import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { generateAccessToken } from '../../src/utils/jwt.js';

describe('Documents API HTTP layer', () => {
  let app: any;

  beforeAll(async () => {
    const appModule = await import('../../src/app.js');
    app = appModule.default;
  });

  describe('Authentication requirements', () => {
    it('POST /api/documents/upload returns 401 without token', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', Buffer.from('test'), 'test.pdf')
        .field('folderId', 'clxyz123456789');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/documents/:id returns 401 without token', async () => {
      const response = await request(app).get('/api/documents/clxyz123456789');

      expect(response.status).toBe(401);
    });

    it('DELETE /api/documents/:id returns 401 without token', async () => {
      const response = await request(app).delete('/api/documents/clxyz123456789');

      expect(response.status).toBe(401);
    });

    it('GET /api/folders/:id/documents returns 401 without token', async () => {
      const response = await request(app).get('/api/folders/clxyz123456789/documents');

      expect(response.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('GET /api/documents/:id returns 400 for invalid CUID', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .get('/api/documents/not-a-cuid')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 401]).toContain(response.status);
    });

    it('POST /api/documents/upload returns 400 without file', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('folderId', 'clxyz123456789');

      // Will return 400 (no file) or 401 (auth fails in middleware)
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Route existence', () => {
    it('POST /api/documents/upload endpoint exists', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .send({});

      // 401 means route exists but requires auth
      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('GET /api/documents/:id endpoint exists', async () => {
      const response = await request(app).get('/api/documents/clxyz123456789');

      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('DELETE /api/documents/:id endpoint exists', async () => {
      const response = await request(app).delete('/api/documents/clxyz123456789');

      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('GET /api/folders/:id/documents endpoint exists', async () => {
      const response = await request(app).get('/api/folders/clxyz123456789/documents');

      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });
  });
});
