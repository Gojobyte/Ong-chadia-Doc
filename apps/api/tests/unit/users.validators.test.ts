import { describe, it, expect } from '@jest/globals';
import { Role } from '@prisma/client';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  idParamSchema,
} from '../../src/modules/users/users.validators.js';

describe('users validators', () => {
  describe('createUserSchema', () => {
    it('validates valid user data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.STAFF,
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('defaults role to GUEST if not provided', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(Role.GUEST);
      }
    });

    it('rejects invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const data = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty firstName', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '',
        lastName: 'Doe',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects missing lastName', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INVALID_ROLE',
      };

      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('validates partial update with email only', () => {
      const data = { email: 'new@example.com' };

      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates partial update with role only', () => {
      const data = { role: Role.STAFF };

      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates full update', () => {
      const data = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: Role.CONTRIBUTOR,
      };

      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects empty object', () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const data = { email: 'invalid' };

      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('listUsersQuerySchema', () => {
    it('provides default values for page and limit', () => {
      const result = listUsersQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('coerces string numbers to integers', () => {
      const result = listUsersQuerySchema.safeParse({
        page: '2',
        limit: '50',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it('validates role filter', () => {
      const result = listUsersQuerySchema.safeParse({
        role: Role.STAFF,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(Role.STAFF);
      }
    });

    it('transforms isActive string to boolean', () => {
      const resultTrue = listUsersQuerySchema.safeParse({ isActive: 'true' });
      expect(resultTrue.success).toBe(true);
      if (resultTrue.success) {
        expect(resultTrue.data.isActive).toBe(true);
      }

      const resultFalse = listUsersQuerySchema.safeParse({ isActive: 'false' });
      expect(resultFalse.success).toBe(true);
      if (resultFalse.success) {
        expect(resultFalse.data.isActive).toBe(false);
      }
    });

    it('rejects limit over 100', () => {
      const result = listUsersQuerySchema.safeParse({ limit: '150' });
      expect(result.success).toBe(false);
    });

    it('rejects negative page', () => {
      const result = listUsersQuerySchema.safeParse({ page: '-1' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = listUsersQuerySchema.safeParse({ role: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });

  describe('idParamSchema', () => {
    it('validates valid UUID', () => {
      const result = idParamSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects non-UUID string', () => {
      const result = idParamSchema.safeParse({ id: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('rejects empty string', () => {
      const result = idParamSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });
});
