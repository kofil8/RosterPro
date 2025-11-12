import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  generatePayroll,
  approvePayroll,
} from '../controllers/payroll.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create payroll - Admin/Accountant only
router.post('/', authorize(['ADMIN', 'ACCOUNTANT']), createPayroll);

// Generate payroll from attendance - Admin/Accountant only
router.post('/generate', authorize(['ADMIN', 'ACCOUNTANT']), generatePayroll);

// Get all payroll records - Role-based access
router.get('/', getPayrolls);

// Get single payroll record
router.get('/:id', getPayrollById);

// Update payroll - Admin/Accountant only
router.patch('/:id', authorize(['ADMIN', 'ACCOUNTANT']), updatePayroll);

// Delete payroll - Admin only
router.delete('/:id', authorize(['ADMIN']), deletePayroll);

// Approve payroll - Manager/Admin only
router.post('/:id/approve', authorize(['ADMIN', 'MANAGER']), approvePayroll);

export default router;

