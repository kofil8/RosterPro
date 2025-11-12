import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokens,
  isRefreshTokenValid,
} from '../services/jwt.service';
import { sendWelcomeEmail } from '../services/email.service';
import { successResponse, errorResponse, sanitizeUser } from '../utils/helpers';
import { AuthRequest, JWTPayload, LoginDTO, RegisterDTO } from '../types';
import { UserRole } from '@prisma/client';

/**
 * Register new user and company
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, companyName, companyEmail, phone }: RegisterDTO =
      req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json(errorResponse('User already exists', 'Email is already registered'));
      return;
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail },
    });

    if (existingCompany) {
      res.status(409).json(errorResponse('Company already exists', 'Company email is already registered'));
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        email: companyEmail,
      },
    });

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: UserRole.ADMIN,
        companyId: company.id,
      },
    });

    // Generate tokens
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(user.email, user.firstName).catch(console.error);

    res.status(201).json(
      successResponse(
        {
          accessToken,
          refreshToken,
          user: sanitizeUser(user),
        },
        'Registration successful'
      )
    );
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json(errorResponse('Registration failed', 'An error occurred during registration'));
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      res.status(401).json(errorResponse('Invalid credentials', 'Email or password is incorrect'));
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json(errorResponse('Account disabled', 'Your account has been disabled'));
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json(errorResponse('Invalid credentials', 'Email or password is incorrect'));
      return;
    }

    // Generate tokens
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    res.json(
      successResponse(
        {
          accessToken,
          refreshToken,
          user: sanitizeUser(user),
        },
        'Login successful'
      )
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse('Login failed', 'An error occurred during login'));
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json(errorResponse('Refresh token required', 'No refresh token provided'));
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      res.status(401).json(errorResponse('Invalid refresh token', 'Token verification failed'));
      return;
    }

    // Check if token exists in database
    const isValid = await isRefreshTokenValid(token);

    if (!isValid) {
      res.status(401).json(errorResponse('Invalid refresh token', 'Token not found or expired'));
      return;
    }

    // Generate new tokens
    const payload: JWTPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Delete old refresh token and store new one
    await deleteRefreshToken(token);
    await storeRefreshToken(decoded.id, newRefreshToken);

    res.json(
      successResponse(
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        'Token refreshed successfully'
      )
    );
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json(errorResponse('Token refresh failed', 'An error occurred'));
  }
};

/**
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await deleteRefreshToken(token);
    }

    res.json(successResponse(null, 'Logout successful'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(errorResponse('Logout failed', 'An error occurred during logout'));
  }
};

/**
 * Logout from all devices
 */
export const logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    await deleteAllRefreshTokens(req.user.id);

    res.json(successResponse(null, 'Logged out from all devices'));
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json(errorResponse('Logout failed', 'An error occurred'));
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    res.json(successResponse(sanitizeUser(user), 'User retrieved successfully'));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(errorResponse('Failed to get user', 'An error occurred'));
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json(errorResponse('Invalid password', 'Current password is incorrect'));
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Logout from all devices
    await deleteAllRefreshTokens(user.id);

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(errorResponse('Failed to change password', 'An error occurred'));
  }
};

