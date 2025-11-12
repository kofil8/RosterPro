import { Router } from 'express';
import { z } from 'zod';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateBody(createUserSchema),
  asyncHandler(createUser)
);

router.get('/', asyncHandler(getUsers));

router.get('/:id', validateParams(idParamSchema), asyncHandler(getUserById));

router.patch('/:id', validateParams(idParamSchema), validateBody(updateUserSchema), asyncHandler(updateUser));

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(idParamSchema),
  asyncHandler(deleteUser)
);

router.get('/:id/stats', validateParams(idParamSchema), asyncHandler(getUserStats));

export default router;

