import { registerSchema, loginSchema, refreshSchema } from '../../src/modules/auth/auth.validators.js';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should validate valid registration input', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const input = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty firstName', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login input', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const input = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('refreshSchema', () => {
    it('should validate valid refresh token input', () => {
      const input = {
        refreshToken: 'some-refresh-token',
      };

      const result = refreshSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const input = {
        refreshToken: '',
      };

      const result = refreshSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
