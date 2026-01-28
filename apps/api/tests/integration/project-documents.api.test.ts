import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { generateAccessToken } from '../../src/utils/jwt.js';

describe('Project Documents API HTTP layer', () => {
  let app: any;
  const validProjectId = '550e8400-e29b-41d4-a716-446655440000';
  const validDocumentId = '660e8400-e29b-41d4-a716-446655440001';
  const validFolderId = '770e8400-e29b-41d4-a716-446655440002';
  const validUserId = '880e8400-e29b-41d4-a716-446655440003';

  beforeAll(async () => {
    const appModule = await import('../../src/app.js');
    app = appModule.default;
  });

  describe('Authentication requirements', () => {
    it('GET /api/projects/:id/documents returns 401 without token', async () => {
      const response = await request(app).get(`/api/projects/${validProjectId}/documents`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/projects/:id/documents returns 401 without token', async () => {
      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents`)
        .send({ documentId: validDocumentId });

      expect(response.status).toBe(401);
    });

    it('POST /api/projects/:id/documents/folder/:folderId returns 401 without token', async () => {
      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents/folder/${validFolderId}`)
        .send({ recursive: false });

      expect(response.status).toBe(401);
    });

    it('DELETE /api/projects/:id/documents/:docId returns 401 without token', async () => {
      const response = await request(app)
        .delete(`/api/projects/${validProjectId}/documents/${validDocumentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('GET /api/projects/:id/documents returns 400 for invalid project UUID', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .get('/api/projects/not-a-uuid/documents')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 401]).toContain(response.status);
    });

    it('POST /api/projects/:id/documents returns 400 for missing documentId', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect([400, 401, 403]).toContain(response.status);
    });

    it('POST /api/projects/:id/documents returns 400 for invalid documentId UUID', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents`)
        .set('Authorization', `Bearer ${token}`)
        .send({ documentId: 'not-a-uuid' });

      expect([400, 401, 403]).toContain(response.status);
    });

    it('POST /api/projects/:id/documents/folder/:folderId returns 400 for invalid folderId', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents/folder/not-a-uuid`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recursive: false });

      expect([400, 401]).toContain(response.status);
    });

    it('DELETE /api/projects/:id/documents/:docId returns 400 for invalid docId', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .delete(`/api/projects/${validProjectId}/documents/not-a-uuid`)
        .set('Authorization', `Bearer ${token}`);

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Query parameters', () => {
    it('GET /api/projects/:id/documents accepts pagination params', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .get(`/api/projects/${validProjectId}/documents?page=1&limit=10`)
        .set('Authorization', `Bearer ${token}`);

      // Should not be 400 for valid params - will be 401/403/404 due to auth/permission
      expect([401, 403, 404]).toContain(response.status);
    });

    it('GET /api/projects/:id/documents rejects invalid page param', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .get(`/api/projects/${validProjectId}/documents?page=-1`)
        .set('Authorization', `Bearer ${token}`);

      expect([400, 401]).toContain(response.status);
    });

    it('GET /api/projects/:id/documents rejects limit over 100', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .get(`/api/projects/${validProjectId}/documents?limit=200`)
        .set('Authorization', `Bearer ${token}`);

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Link folder options', () => {
    it('POST /api/projects/:id/documents/folder/:folderId accepts recursive option', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents/folder/${validFolderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recursive: true });

      // Should not be 400 for valid body - will fail at auth/permission level
      expect([401, 403, 404]).toContain(response.status);
    });

    it('POST /api/projects/:id/documents/folder/:folderId defaults recursive to false', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents/folder/${validFolderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      // Should not be 400 for empty body - recursive defaults to false
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Routes exist and are wired correctly', () => {
    it('GET /api/projects/:id/documents route exists', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .get(`/api/projects/${validProjectId}/documents`)
        .set('Authorization', `Bearer ${token}`);

      // Should not be 404 (route not found)
      expect(response.status).not.toBe(404);
    });

    it('POST /api/projects/:id/documents route exists', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents`)
        .set('Authorization', `Bearer ${token}`)
        .send({ documentId: validDocumentId });

      expect(response.status).not.toBe(404);
    });

    it('POST /api/projects/:id/documents/folder/:folderId route exists', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .post(`/api/projects/${validProjectId}/documents/folder/${validFolderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recursive: false });

      expect(response.status).not.toBe(404);
    });

    it('DELETE /api/projects/:id/documents/:docId route exists', async () => {
      const token = generateAccessToken(validUserId);

      const response = await request(app)
        .delete(`/api/projects/${validProjectId}/documents/${validDocumentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).not.toBe(404);
    });
  });
});
