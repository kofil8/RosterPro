import { Router } from 'express';
import { z } from 'zod';
import {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
  assignShift,
} from '../controllers/shift.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { UserRole, ShiftStatus } from '@prisma/client';

const router = Router();

// Validation schemas
const createShiftSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  location: z.string().optional(),
  notes: z.string().optional(),
  rosterId: z.string().cuid('Invalid roster ID'),
  assignedUserId: z.string().cuid('Invalid user ID').optional(),
});

const updateShiftSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(ShiftStatus).optional(),
  assignedUserId: z.string().cuid().optional().nullable(),
});

const assignShiftSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateBody(createShiftSchema),
  asyncHandler(createShift)
);

router.get('/', asyncHandler(getShifts));

router.get('/:id', validateParams(idParamSchema), asyncHandler(getShiftById));

router.patch(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  validateBody(updateShiftSchema),
  asyncHandler(updateShift)
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  asyncHandler(deleteShift)
);

router.post(
  '/:id/assign',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  validateBody(assignShiftSchema),
  asyncHandler(assignShift)
);

export default router;

