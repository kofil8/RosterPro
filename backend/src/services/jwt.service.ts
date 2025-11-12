import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import prisma from '../config/database';
import { generateRandomString } from '../utils/helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Store refresh token in database
 */
export const storeRefreshToken = async (userId: string, token: string): Promise<void> => {
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    throw new Error('Invalid refresh token');
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

/**
 * Delete refresh token from database
 */
export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Delete all refresh tokens for a user
 */
export const deleteAllRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Check if refresh token exists in database
 */
export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) {
    return false;
  }

  // Check if expired
  if (refreshToken.expiresAt < new Date()) {
    await deleteRefreshToken(token);
    return false;
  }

  return true;
};

/**
 * Clean up expired refresh tokens
 */
export const cleanupExpiredTokens = async (): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

// Schedule cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

