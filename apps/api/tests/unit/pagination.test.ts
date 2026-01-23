import { describe, it, expect } from '@jest/globals';
import { calculatePagination, getPrismaSkipTake } from '../../src/common/pagination.js';

describe('pagination helper', () => {
  describe('calculatePagination', () => {
    it('calculates correct pagination meta for first page', () => {
      const result = calculatePagination(1, 20, 100);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
      });
    });

    it('calculates correct pagination meta for middle page', () => {
      const result = calculatePagination(3, 20, 100);

      expect(result).toEqual({
        page: 3,
        limit: 20,
        total: 100,
        totalPages: 5,
      });
    });

    it('handles partial last page correctly', () => {
      const result = calculatePagination(1, 20, 45);

      expect(result.totalPages).toBe(3);
    });

    it('handles exact division', () => {
      const result = calculatePagination(1, 20, 60);

      expect(result.totalPages).toBe(3);
    });

    it('handles empty results', () => {
      const result = calculatePagination(1, 20, 0);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it('handles single item', () => {
      const result = calculatePagination(1, 20, 1);

      expect(result.totalPages).toBe(1);
    });

    it('handles limit equal to total', () => {
      const result = calculatePagination(1, 100, 100);

      expect(result.totalPages).toBe(1);
    });

    it('handles limit greater than total', () => {
      const result = calculatePagination(1, 100, 50);

      expect(result.totalPages).toBe(1);
    });
  });

  describe('getPrismaSkipTake', () => {
    it('calculates correct skip and take for first page', () => {
      const result = getPrismaSkipTake(1, 20);

      expect(result).toEqual({
        skip: 0,
        take: 20,
      });
    });

    it('calculates correct skip and take for second page', () => {
      const result = getPrismaSkipTake(2, 20);

      expect(result).toEqual({
        skip: 20,
        take: 20,
      });
    });

    it('calculates correct skip and take for third page', () => {
      const result = getPrismaSkipTake(3, 10);

      expect(result).toEqual({
        skip: 20,
        take: 10,
      });
    });

    it('handles different limit values', () => {
      const result = getPrismaSkipTake(5, 50);

      expect(result).toEqual({
        skip: 200,
        take: 50,
      });
    });
  });
});
