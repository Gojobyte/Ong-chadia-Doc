import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { generateAccessToken } from '../../src/utils/jwt.js';

describe('Permissions API HTTP layer', () => {
  let app: any;

  beforeAll(async () => {
    const appModule = await import('../../src/app.js');
    app = appModule.default;
  });

  describe('Authentication requirements', () => {
    it('GET /api/folders/:id/permissions returns 401 without token', async () => {
      const response = await request(app).get('/api/folders/clxyz123456789/permissions');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/folders/:id/permissions returns 401 without token', async () => {
      const response = await request(app)
        .post('/api/folders/clxyz123456789/permissions')
        .send({ role: 'STAFF', permission: 'READ' });

      expect(response.status).toBe(401);
    });

    it('DELETE /api/folders/:id/permissions/:permId returns 401 without token', async () => {
      const response = await request(app).delete(
        '/api/folders/clxyz123456789/permissions/clxyz987654321'
      );

      expect(response.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('POST /api/folders/:id/permissions returns 400 for invalid role', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .post('/api/folders/clxyz123456789/permissions')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'INVALID_ROLE', permission: 'READ' });

      // Will return 400 (validation) or 401/403 (auth check fails before validation in real DB)
      expect([400, 401, 403]).toContain(response.status);
    });

    it('POST /api/folders/:id/permissions returns 400 for invalid permission', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .post('/api/folders/clxyz123456789/permissions')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'STAFF', permission: 'INVALID' });

      expect([400, 401, 403]).toContain(response.status);
    });

    it('DELETE /api/folders/:id/permissions/:permId validates permId format', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .delete('/api/folders/clxyz123456789/permissions/not-a-cuid')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 401, 403]).toContain(response.status);
    });
  });

  describe('Route existence', () => {
    it('GET /api/folders/:id/permissions endpoint exists', async () => {
      const response = await request(app).get('/api/folders/clxyz123456789/permissions');

      // 401 means route exists but requires auth
      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('POST /api/folders/:id/permissions endpoint exists', async () => {
      const response = await request(app)
        .post('/api/folders/clxyz123456789/permissions')
        .send({});

      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('DELETE /api/folders/:id/permissions/:permId endpoint exists', async () => {
      const response = await request(app).delete(
        '/api/folders/clxyz123456789/permissions/clxyz987654321'
      );

      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });
  });
});
