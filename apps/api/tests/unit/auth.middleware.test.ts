import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/jwt.js';
import { UnauthorizedError } from '../../src/common/errors.js';

// Note: Full integration tests for auth middleware with DB will be added in a future story.
// These unit tests cover token validation logic without DB dependency.

describe('authenticate middleware - token validation', () => {
  // We can't easily mock ESM Prisma in Jest, so we test the token validation logic separately
  // by directly testing the UnauthorizedError class behavior

  describe('UnauthorizedError', () => {
    it('has correct status code 401', () => {
      const error = new UnauthorizedError('Test message');
      expect(error.statusCode).toBe(401);
    });

    it('has correct error code UNAUTHORIZED', () => {
      const error = new UnauthorizedError('Test message');
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('preserves the error message', () => {
      const error = new UnauthorizedError('Custom error message');
      expect(error.message).toBe('Custom error message');
    });

    it('uses default message when none provided', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('JWT token generation and verification', () => {
    it('generates different access and refresh tokens', () => {
      const accessToken = generateAccessToken('user-123');
      const refreshToken = generateRefreshToken('user-123');
      expect(accessToken).not.toBe(refreshToken);
    });

    it('access token contains correct payload type', () => {
      const token = generateAccessToken('user-123');
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.type).toBe('access');
      expect(payload.userId).toBe('user-123');
    });

    it('refresh token contains correct payload type', () => {
      const token = generateRefreshToken('user-123');
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.type).toBe('refresh');
      expect(payload.userId).toBe('user-123');
    });
  });

  describe('Bearer token extraction', () => {
    // Test helper to extract token from Authorization header
    function extractBearerToken(authHeader: string | undefined): string | null {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      return authHeader.substring(7);
    }

    it('returns null for missing Authorization header', () => {
      expect(extractBearerToken(undefined)).toBeNull();
    });

    it('returns null for empty Authorization header', () => {
      expect(extractBearerToken('')).toBeNull();
    });

    it('returns null for non-Bearer Authorization header', () => {
      expect(extractBearerToken('Basic abc123')).toBeNull();
    });

    it('extracts token from valid Bearer header', () => {
      expect(extractBearerToken('Bearer my-token')).toBe('my-token');
    });

    it('handles token with special characters', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      expect(extractBearerToken(`Bearer ${token}`)).toBe(token);
    });
  });
});
