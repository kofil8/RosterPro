import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  generatePayroll,
  approvePayroll,
} from "../controllers/payroll.controller";
import { UserRole } from "@prisma/client";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create payroll - Admin/Accountant only
router.post("/", authorize(UserRole.ADMIN, UserRole.ACCOUNTANT), createPayroll);

// Generate payroll from attendance - Admin/Accountant only
router.post(
  "/generate",
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  generatePayroll
);

// Get all payroll records - Role-based access
router.get("/", getPayrolls);

// Get single payroll record
router.get("/:id", getPayrollById);

// Update payroll - Admin/Accountant only
router.patch(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  updatePayroll
);

// Delete payroll - Admin only
router.delete("/:id", authorize(UserRole.ADMIN), deletePayroll);

// Approve payroll - Manager/Admin only
router.post(
  "/:id/approve",
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  approvePayroll
);

export default router;
