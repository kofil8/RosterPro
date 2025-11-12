import { Router } from 'express';
import { z } from 'zod';
import {
  getDashboardAnalytics,
  getCompanyStats,
  getRecentActivity,
  updateCompanySettings,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation schemas
const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  logo: z.string().url().optional(),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/analytics', asyncHandler(getDashboardAnalytics));

router.get('/company/stats', asyncHandler(getCompanyStats));

router.get('/activity', asyncHandler(getRecentActivity));

router.patch(
  '/company/settings',
  authorize(UserRole.ADMIN),
  validateBody(updateCompanySchema),
  asyncHandler(updateCompanySettings)
);

export default router;

