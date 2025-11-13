import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { JWTPayload } from "../types";
import prisma from "../config/database";

// ENV Secrets
const JWT_SECRET: Secret =
  process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET: Secret =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key";
const JWT_EXPIRES_IN = 15 * 60; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

/**
 * Store refresh token in database
 */
export const storeRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Valid 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

/**
 * Delete single refresh token
 */
export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Delete all tokens for a user
 */
export const deleteAllRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Check token validity in DB
 */
export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) return false;

  if (refreshToken.expiresAt < new Date()) {
    await deleteRefreshToken(token);
    return false;
  }

  return true;
};

/**
 * Cleanup expired tokens
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

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
