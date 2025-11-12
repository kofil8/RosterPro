import { Router } from 'express';
import { z } from 'zod';
import {
  createRoster,
  getRosters,
  getRosterById,
  updateRoster,
  deleteRoster,
  publishRoster,
} from '../controllers/roster.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation schemas
const createRosterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
});

const updateRosterSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }).optional(),
  isPublished: z.boolean().optional(),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateBody(createRosterSchema),
  asyncHandler(createRoster)
);

router.get('/', asyncHandler(getRosters));

router.get('/:id', validateParams(idParamSchema), asyncHandler(getRosterById));

router.patch(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  validateBody(updateRosterSchema),
  asyncHandler(updateRoster)
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  asyncHandler(deleteRoster)
);

router.post(
  '/:id/publish',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  asyncHandler(publishRoster)
);

export default router;

