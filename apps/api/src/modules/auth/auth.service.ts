import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../../common/errors.js';
import type { RegisterInput, LoginInput } from './auth.validators.js';

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: 'GUEST',
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
    });

    return user;
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token hash
    const tokenHash = await hashPassword(refreshToken);
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Find all non-revoked refresh tokens for the user
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    // Check if any token hash matches
    let validToken = null;
    for (const token of storedTokens) {
      const matches = await comparePassword(refreshToken, token.tokenHash);
      if (matches) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedError('Refresh token not found or revoked');
    }

    // Generate new access token
    const accessToken = generateAccessToken(payload.userId);

    return { accessToken };
  },

  async logout(userId: string, refreshToken: string) {
    // Find and revoke all refresh tokens for user that match
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
      },
    });

    for (const token of storedTokens) {
      const matches = await comparePassword(refreshToken, token.tokenHash);
      if (matches) {
        await prisma.refreshToken.update({
          where: { id: token.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }

    return { success: true };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  },
};
