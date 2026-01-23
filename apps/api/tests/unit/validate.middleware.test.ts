import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateQuery, validateParams } from '../../src/middleware/validate.middleware.js';

describe('validate middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { body: {}, query: {}, params: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validate (body)', () => {
    const testSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    });

    it('calls next() for valid body', () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const middleware = validate(testSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('returns 400 for missing required fields', () => {
      mockReq.body = {};
      const middleware = validate(testSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
        })
      );
    });

    it('returns 400 for invalid email format', () => {
      mockReq.body = { email: 'not-an-email', password: 'password123' };
      const middleware = validate(testSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Invalid email format'),
        })
      );
    });

    it('returns 400 for short password', () => {
      mockReq.body = { email: 'test@example.com', password: 'short' };
      const middleware = validate(testSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Password must be at least 8 characters'),
        })
      );
    });

    it('returns all validation errors combined', () => {
      mockReq.body = { email: 'invalid', password: 'short' };
      const middleware = validate(testSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Invalid email format'),
        })
      );
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
    });

    it('calls next() for valid query', () => {
      mockReq.query = { page: '1', limit: '10' };
      const middleware = validateQuery(querySchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('calls next() for empty query when all fields optional', () => {
      mockReq.query = {};
      const middleware = validateQuery(querySchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams', () => {
    const paramsSchema = z.object({
      id: z.string().uuid('Invalid UUID format'),
    });

    it('calls next() for valid params', () => {
      mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const middleware = validateParams(paramsSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('returns 400 for invalid UUID', () => {
      mockReq.params = { id: 'not-a-uuid' };
      const middleware = validateParams(paramsSchema);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Invalid UUID format'),
        })
      );
    });
  });
});
