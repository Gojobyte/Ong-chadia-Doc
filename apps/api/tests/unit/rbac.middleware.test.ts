import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import {
  authorize,
  isSuperAdmin,
  isStaffOrAbove,
  isContributorOrAbove,
} from '../../src/middleware/rbac.middleware.js';

describe('authorize middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const createUser = (role: Role) => ({
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role,
    isActive: true,
  });

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authorize function', () => {
    it('returns 401 when user is not authenticated', () => {
      const middleware = authorize(Role.GUEST);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
        })
      );
    });

    it('returns 403 when user role is not in allowed roles', () => {
      mockReq.user = createUser(Role.GUEST);
      const middleware = authorize(Role.SUPER_ADMIN, Role.STAFF);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Insufficient permissions',
        })
      );
    });

    it('calls next() when user role is in allowed roles', () => {
      mockReq.user = createUser(Role.STAFF);
      const middleware = authorize(Role.STAFF);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('allows access when user has any of the allowed roles', () => {
      mockReq.user = createUser(Role.CONTRIBUTOR);
      const middleware = authorize(Role.STAFF, Role.CONTRIBUTOR, Role.GUEST);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('isSuperAdmin guard', () => {
    it('allows SUPER_ADMIN', () => {
      mockReq.user = createUser(Role.SUPER_ADMIN);

      isSuperAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('denies STAFF', () => {
      mockReq.user = createUser(Role.STAFF);

      isSuperAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it('denies CONTRIBUTOR', () => {
      mockReq.user = createUser(Role.CONTRIBUTOR);

      isSuperAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it('denies GUEST', () => {
      mockReq.user = createUser(Role.GUEST);

      isSuperAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });
  });

  describe('isStaffOrAbove guard', () => {
    it('allows SUPER_ADMIN', () => {
      mockReq.user = createUser(Role.SUPER_ADMIN);

      isStaffOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('allows STAFF', () => {
      mockReq.user = createUser(Role.STAFF);

      isStaffOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('denies CONTRIBUTOR', () => {
      mockReq.user = createUser(Role.CONTRIBUTOR);

      isStaffOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it('denies GUEST', () => {
      mockReq.user = createUser(Role.GUEST);

      isStaffOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });
  });

  describe('isContributorOrAbove guard', () => {
    it('allows SUPER_ADMIN', () => {
      mockReq.user = createUser(Role.SUPER_ADMIN);

      isContributorOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('allows STAFF', () => {
      mockReq.user = createUser(Role.STAFF);

      isContributorOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('allows CONTRIBUTOR', () => {
      mockReq.user = createUser(Role.CONTRIBUTOR);

      isContributorOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('denies GUEST', () => {
      mockReq.user = createUser(Role.GUEST);

      isContributorOrAbove(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });
  });
});
