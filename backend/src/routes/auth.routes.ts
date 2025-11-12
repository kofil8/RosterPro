import { Router } from 'express';
import { z } from 'zod';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getCurrentUser,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  companyEmail: z.string().email('Invalid company email format'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Routes
router.post('/register', authLimiter, validateBody(registerSchema), asyncHandler(register));
router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(login));
router.post('/refresh', validateBody(refreshTokenSchema), asyncHandler(refreshToken));
router.post('/logout', authenticate, asyncHandler(logout));
router.post('/logout-all', authenticate, asyncHandler(logoutAll));
router.get('/me', authenticate, asyncHandler(getCurrentUser));
router.post('/change-password', authenticate, validateBody(changePasswordSchema), asyncHandler(changePassword));

export default router;

