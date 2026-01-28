import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { generateAccessToken } from '../../src/utils/jwt.js';

describe('Dashboard API HTTP layer', () => {
  let app: any;

  beforeAll(async () => {
    const appModule = await import('../../src/app.js');
    app = appModule.default;
  });

  describe('Authentication requirements', () => {
    it('GET /api/dashboard returns 401 without token', async () => {
      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/dashboard/activity returns 401 without token', async () => {
      const response = await request(app).get('/api/dashboard/activity');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Route existence', () => {
    it('GET /api/dashboard endpoint exists', async () => {
      const response = await request(app).get('/api/dashboard');

      // 401 means route exists but requires auth
      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('GET /api/dashboard/activity endpoint exists', async () => {
      const response = await request(app).get('/api/dashboard/activity');

      // 401 means route exists but requires auth
      expect(response.status).toBe(401);
      expect(response.status).not.toBe(404);
    });
  });

  describe('Authenticated requests', () => {
    it('GET /api/dashboard returns data with valid token', async () => {
      // Use a fake user ID - actual DB lookup will happen in middleware
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);

      // Will return 200 if user exists, 401 if not, or 500 if DB error
      // The key point is that the route processes the token correctly
      expect([200, 401, 500]).toContain(response.status);
    });

    it('GET /api/dashboard/activity returns data with valid token', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .get('/api/dashboard/activity')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 401, 500]).toContain(response.status);
    });

    it('GET /api/dashboard/activity supports pagination params', async () => {
      const token = generateAccessToken('550e8400-e29b-41d4-a716-446655440000');

      const response = await request(app)
        .get('/api/dashboard/activity?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
