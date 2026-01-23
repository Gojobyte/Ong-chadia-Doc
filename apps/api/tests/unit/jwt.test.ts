import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt.js';

describe('JWT Utils', () => {
  const testUserId = 'test-user-id-123';

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = generateAccessToken(testUserId);
      const payload = verifyAccessToken(token);

      expect(payload.userId).toBe(testUserId);
      expect(payload.type).toBe('access');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw for refresh token used as access token', () => {
      const refreshToken = generateRefreshToken(testUserId);
      // This should throw because the secrets are different
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      const payload = verifyRefreshToken(token);

      expect(payload.userId).toBe(testUserId);
      expect(payload.type).toBe('refresh');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});
